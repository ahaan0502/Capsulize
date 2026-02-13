const express = require('express');
const router = express.Router();
const Capsule = require('../models/Capsule');
const authenticate = require('../middleware/auth');
const {generatePuzzle} = require('../utils/openai');

//Create a new capsule post
router.post('/', async (req, res) => {
    try {
        const {content, unlockDate} = req.body;

        const user = req.user;
        const puzzleData = await generatePuzzle(content, {
            skillLevel: user.profile?.skillLevel || 'intermediate'
        });

        const capsule = new Capsule({
            userId: req.user.userId,
            content: content,
            puzzle: {
                type: puzzleData.type,
                question: puzzleData.question,
                difficulty: puzzleData.difficulty,
                hints: puzzleData.hints
            },
            unlockDate: new Date(unlockDate),
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
        res.status(500).json({error: error.message})
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

module.exports = router;