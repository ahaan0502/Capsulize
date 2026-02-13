const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const generatePuzzle = async (content, userProfile = {}) => {
    try {
        const prompt = `You are creating a personalized puzzle for a time capsule. Based on the following content created by the user, create a puzzle that only their future self could solve. It should be a test of their memory.
        User's content: "${content}" 

        User's skill level: ${userProfile.skillLevel}
        
        Generate a puzzle in the following JSON format:
        {
            "type": "trivia" | "reflection",
            "question": "The puzzle question or prompt",
            "difficulty": "easy" | "medium" | "hard",
            "hints": ["hint1", "hint2"],
        }
        
        For a trivia puzzle, ask about either knowledge they should have gained from the experience or trivia regarding what they wrote about.
        For a reflection puzzle, ask an open-ended question about personal growth.

        Return only valid JSON, no other text.`;
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {role: 'system', content: 'You are a puzzle generator for a time capsule app. Return only valid JSON.'},
                {role: 'user', content: prompt}
            ],
            temperature: 0.7,
            response_format: {type: 'json_object'}
        });

        const puzzleData = JSON.parse(response.choices[0].message.content);
        return puzzleData;
    } catch (error) {
        console.error('OpenAI error:', error);
        throw new Error('Failed to generate puzzle');
    }
};

const validateAnswer = async (question, userAnswer, originalContent) => {
    try {
        const prompt = `You are evaluating wether a user has correctly answered trivia or demonstrated personal growth within a reasonable degree.
        
        Original content that the user wrote: ${originalContent},
        Puzzle question: ${question},
        User's answer to the question: ${userAnswer}
        
        Determine if their answer demonstrates:
        An understanding of their past experience, thoughtful engagement with the question, and/or evidence of reflection/growth.
        
        Return only valid JSON in the following format:
        {
            "isValid": true/false,
            "feedback": "Brief explanation of why the answer does or doesn't meet the criteria."
        }`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {role: 'system', content: 'You are evaluating personal reflection. Return only valid JSON'},
                {role: "user", content: prompt}
            ],
            temperature: 0.3,
            response_format: {type: 'json_object'}
        });

        const validation = JSON.parse(response.choices[0].message.content);
        return validation;
    } catch (error) {
        console.error('OpenAI error:', error);
        throw new Error('Failed to validate answer')
    }
};

module.exports = {
    generatePuzzle,
    validateAnswer
};