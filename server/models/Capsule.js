const mongoose = require('mongoose');

const capsuleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxLength: 3000
    },
    puzzle: {
        type: {
            type: String,
            enum: ['trivia', 'reflection'],
            required: true
        },
        question: {
            type: String,
            required: true
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            required: true
        },
        hints: [String]
    },
    unlockDate: {
        type: Date,
        required: true
    },
    isUnlocked: {
        type: Boolean,
        default: false
    },
    unlockedAt: {
        type: Number,
        default: null
    },
    unlockAttempts: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

module.exports = mongoose.model('Capsule', capsuleSchema);