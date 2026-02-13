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