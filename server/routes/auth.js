const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const validator = require('validator');

const router = express.Router();

//Register new user
router.post('/register', async (req, res) => {
    try {
        const {email, password} = req.body;

        //Validate email 
        if(!email || !validator.isEmail(email)) {
            return res.status(400).json({error: 'Invalid email'});
        }

        //Validate password        
        if(!password) {
            return res.status(400).json({error: 'Password is required'});
        }
        if(password.length < 8) {
            return res.status(400).json({error: 'Password must be at least 8 characters'});
        }
        if(password.length > 128) {
            return res.status(400).json({error: 'Password can\'t exceed 128 characters'});
        }

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
            process.env.JWT_SECRET,
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
        
        //Validate required fields
        if(!email || !password) {
            return res.status(400).json({error: 'Email and password are required'});
        }

        //Validate email format
        if(!validator.isEmail(email)) {
            return res.status(400).json({error: 'Invalid email format'});
        }

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
            process.env.JWT_SECRET,
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
        console.error('Login error:', error);
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