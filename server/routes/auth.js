const express = require('express');
const jwt = require('jsonwebtoken');
const User = require ('../models/User');

const router = express.Router();

//Register new user
router.post('/register', async (req, res) => {
    try {
        const {email, password} = req.body;

        //Check for existing user
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({error: 'User already exists'});
        }

        //Create a new user
        const user = new User({email, password});
        await user.save();

        //Create token
        const token = jwt.sign(
            {userId: user._id, email: user.email},
            process.env.JWTSECRET,
            {expiresIn: '7d'}
        );
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({error: 'Server error'});
    }
});

//Login user
router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        //Find user
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({error: 'Invalid credentials'});
        }

        //Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({error: 'Invalid credentials'});
        }

        //Create token
        const token = jwt.sign(
            {userId: user._id, email: user.email},
            process.env.JWTSECRET,
            {expiresIn: '7d'}
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({error: 'Server error'});
    }
});

//Get current user
router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({error: 'Server error'});
    }
});

module.exports = router;