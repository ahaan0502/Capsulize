const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose')
const connectDB = require('./config/database');

dotenv.config();

const app = express();

connectDB();

// Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', require('./routes/auth'));
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
      {skillLevel: 'beginner'}
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
    
    // Hardcoded test data
    const testContent = ""; //Post content
    const testUnlockDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
    const testUserId = "000000000000000000000001"; // Fake user ID
    
    // Generate puzzle
    console.log('Generating puzzle...');
    const puzzleData = await generatePuzzle(testContent, {
      interests: ['coding', 'algorithms'],
      skillLevel: 'beginner'
    });
    
    console.log('Puzzle generated:', puzzleData);
    
    // Create capsule
    const capsule = new Capsule({
      userId: testUserId,
      content: testContent,
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


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});