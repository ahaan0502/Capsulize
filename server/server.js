const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose')
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler')

dotenv.config();

const app = express();

connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later'
});

//Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/capsules', require('./routes/capsule'));
app.use('/api/', limiter);
//Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running!',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});
//OpenAI puzzle gen test route
app.post('/api/test-openai', async (req, res) => {
  try {
    const { generatePuzzle } = require('./utils/openai');
    
    const puzzle = await generatePuzzle(
      "", //Content
      {skillLevel: 'expert'}
    );
    
    res.json({ success: true, puzzle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//OpenAI validation test route
app.post('/api/test-validation', async (req, res) => {
  try {
    const { validateAnswer } = require('./utils/openai');
    
    const validation = await validateAnswer(
      "", //Question
      "", //Answer
      "" //Original content
    );
    
    res.json({ success: true, validation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Test route for creating a capsule (without auth for easy testing)
app.post('/api/test-create-capsule', async (req, res) => {
  try {
    const Capsule = require('./models/Capsule');
    const { generatePuzzle } = require('./utils/openai');
    
    // Use data from request body
    const {content, skillLevel} = req.body;
    
    // Validate content exists
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content is required' 
      });
    }
    
    const testUnlockDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const testUserId = "000000000000000000000001"; // Fake user ID
    
    // Generate puzzle
    console.log('Generating puzzle...');
    const puzzleData = await generatePuzzle(content, {
      skillLevel: skillLevel || 'beginner'
    });
    
    console.log('Puzzle generated:', puzzleData);
    
    // Create capsule
    const capsule = new Capsule({
      userId: testUserId,
      content: content,  // ← Now uses actual content from request
      puzzle: {
        type: puzzleData.type,
        question: puzzleData.question,
        difficulty: puzzleData.difficulty,
        hints: puzzleData.hints || [],
        expectedAnswer: puzzleData.expectedAnswer || null
      },
      unlockDate: testUnlockDate,
      isUnlocked: false,
      unlockAttempts: 0
    });
    
    await capsule.save();
    console.log('Capsule saved to database');
    
    res.json({
      success: true,
      message: 'Test capsule created!',
      capsule: {
        id: capsule._id,
        content: capsule.content,
        puzzle: capsule.puzzle,
        unlockDate: capsule.unlockDate,
        createdAt: capsule.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error creating test capsule:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

//Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});