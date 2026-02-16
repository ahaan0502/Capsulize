const express = require('express');
const router = express.Router();
const Capsule = require('../models/Capsule');
const authenticate = require('../middleware/auth');
const {generatePuzzle} = require('../utils/openai');

//Create a new capsule post
router.post('/', authenticate, async (req, res) => {
    try {
        const { content, unlockDate } = req.body;
        const User = require('../models/user');

        // Validate content
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        if (content.trim().length < 20) {
            return res.status(400).json({ error: 'Content must be at least 20 characters' });
        }

        // Validate unlock date
        if (!unlockDate) {
            return res.status(400).json({ error: 'Unlock date is required' });
        }

        const unlockDateObj = new Date(unlockDate);
        if (unlockDateObj <= new Date()) {
            return res.status(400).json({ error: 'Unlock date must be in the future' });
        }

        // Fetch the full user from database to get profile
        const user = await User.findById(req.user.userId);
        const skillLevel = user?.profile?.skillLevel || 'intermediate';

        // Generate puzzle
        const puzzleData = await generatePuzzle(content, {
            skillLevel: skillLevel
        });

        // Create capsule
        const capsule = new Capsule({
            userId: req.user.userId,
            content: content,
            puzzle: {
                type: puzzleData.type,
                question: puzzleData.question,
                difficulty: puzzleData.difficulty,
                hints: puzzleData.hints || [],
                expectedAnswer: puzzleData.expectedAnswer || null
            },
            unlockDate: unlockDateObj,
        });
        
        await capsule.save();
        
        res.status(201).json({
            message: 'Time capsule created',
            capsule: {
                id: capsule._id,
                unlockDate: capsule.unlockDate,
                puzzle: {
                    question: capsule.puzzle.question,
                    difficulty: capsule.puzzle.difficulty,
                    hints: capsule.puzzle.hints
                }
            }
        });
    } catch (error) {
        console.error('Error creating capsule:', error);
        res.status(500).json({ error: error.message });
    }
});

//Get all user's capsules
router.get('/', authenticate, async (req, res) => {
    try {
        const capsules = await Capsule.find({userId: req.user.userId}).select('-content').sort({createdAt: -1});
        res.json(capsules);
    } catch (error) {
        res.status(500).json({error: error.message}); 
    }
});

//Get a single capsule by id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const capsule  = await Capsule.findById(req.params.id);

        if (!capsule) {
            return res.status(404).json({error: 'Capsule not found'});
        }

        if (capsule.userId.toString() !== req.user.userId) {
            return res.status(403).json({error: 'Not authorized to view this capsule'});
        }

        if (capsule.isUnlocked) {
            return res.json({
                id: capsule._id,
                content: capsule.content,
                puzzle: capsule.puzzle,
                unlockDate: capsule.unlockDate,
                isUnlocked: true,
                unlockedAt: capsule.unlockedAt,
                unlockAttempts: capsule.unlockAttempts,
                createdAt: capsule.createdAt
            });
        }

        return res.json({
            id: capsule._id,
            puzzle: {
                question: capsule.puzzle.question,
                difficulty: capsule.puzzle.difficulty,
                hints: capsule.puzzle.hints,
                type: capsule.puzzle.type
            },
            unlockDate: capsule.unlockDate,
            isUnlocked: false,
            unlockAttempts: capsule.unlockAttempts,
            createdAt: capsule.createdAt
        });
    } catch (error) {
        console.error('Error fetching capsule:', error);
        res.status(500).json({error: error.message})
    }
});

//Unlock a given capsule
router.post('/:id/unlock', authenticate, async (req, res) => {
    try {
        const {answer} = req.body;
        const User = require('../models/user');
        
        //Check to see if an answer was provided
        if (!answer || answer.trim() === '') {
            return res.status(400).json({error: 'Please provide an answer'});
        }

        const capsule = await Capsule.findById(req.params.id);

        //Check to see if the capsule exists
        if (!capsule) {
            return res.status(404).json({error: 'Capsule not found'});
        }

        //Check to see if the capsule belongs to the user
        if (capsule.userId.toString() !== req.user.userId) {
            return res.status(403).json({error: 'Not your capsule'});
        }

        //Check to see if the capsule is already unlocked
        if (capsule.isUnlocked) {
            return res.json({
                success: true,
                alreadyUnlocked: true,
                message: 'Capsule was already unlocked',
                content: capsule.content,
                unlockedAt: capsule.unlockedAt
            });
        }

        //Check if unlock date has passed
        if (new Date() < capsule.unlockDate) {
            const timeLeft = capsule.unlockDate - new Date();
            const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

            return res.status(400).json({
                error: 'Capsule cannot be unlocked yet',
                unlockDate: capsule.unlockDate,
                daysLeft: daysLeft
            });
        }

        //Validate answer to a puzzle

        let isCorrect = false;
        let feedback = '';

        const {validateAnswer} = require('../utils/openai');
        const validation = await validateAnswer(
            capsule.puzzle.question,
            answer,
            capsule.content
        );

        isCorrect = validation.isValid;
        feedback = validation.feedback;

        //Increment unlock attempts
        capsule.unlockAttempts += 1;
        

        if (isCorrect) {
            capsule.isUnlocked = true;
            capsule.unlockedAt = new Date();
            await capsule.save();

            const difficulty = capsule.puzzle.difficulty;
            
            const user = await User.findById(req.user.userId);
            
            //Increment the number of posts unlocked
            if (difficulty == "easy") {
                user.profile.postsCompleted++;
            } else if (difficulty == "medium") {
                user.profile.postsCompleted+=3;
            } else {
                user.profile.postsCompleted+=5;
            }

            //Raise the user's skill level upon passing postsCompleted thresholds
            if(user.profile.postsCompleted >= 100) {
                user.skillLevel = "advanced";
            } else if(user.profile.postsCompleted >= 25) {
                user.profile.skillLevel = "intermediate";
            }
            
            return res.json({
                success: true,
                message: 'Capsule is unlocked',
                content: capsule.content,
                unlockedAt: capsule.unlockedAt
            });
        } else {
            //Wrong answer case
            await capsule.save();

            const hintIndex = Math.min(capsule.unlockAttempts - 1, capsule.puzzle.hints.length - 1);
            const hint = capsule.puzzle.hints[hintIndex];

            return res.status(400).json({
                success: false,
                error: 'Incorrect answer',
                feedback: feedback,
                attempts: capsule.unlockAttempts,
                hint: hint || 'No more hints available'
            });
        }
    } catch (error) {
        console.error('Error unlocking capsule:', error);
        res.status(500).json({error: error.message});
    }
});

//Delete a given capsule
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    
    // Check if capsule exists
    if (!capsule) {
      return res.status(404).json({ error: 'Capsule not found' });
    }
    
    // Check if capsule belongs to the user
    if (capsule.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this capsule' });
    }
    
    await Capsule.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Capsule deleted successfully',
      deletedId: req.params.id
    });
    
  } catch (error) {
    console.error('Error deleting capsule:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;