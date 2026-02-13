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
      "",
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
    const { validateSubjectiveAnswer } = require('./utils/openai');
    
    const validation = await validateSubjectiveAnswer(
      "", //Question
      "", //Answer
      "" //Original content
    );
    
    res.json({ success: true, validation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});