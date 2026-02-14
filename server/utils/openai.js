const OpenAI = require('openai');
const user = require('../models/user');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const generatePuzzle = async (content, userProfile = {}) => {
    try {
        //Validation system to determine if a post is acceptable
        const validationPrompt = `Is the following text meaningful and suitable for creating a personal time capsule puzzle? The text should be coherent, personal, and contain actual thoughts or experiences - not random characters,gibberish or empty.

        Text: "${content}"

        Respond with ONLY valid JSON in this format:
        {
        "isValid": true or false,
        "reason": "Brief explanation"
        }`;

        const validationResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {role: 'system', content: 'You are validating text content, return only valid JSON.'},
                {role: 'user', content: validationPrompt}
            ],
            temperature: 0.3,
            response_format: {type: 'json_object'}
        });

        const validation = JSON.parse(validationResponse.choices[0].message.content);

        if (!validation.isValid) {
            throw new Error(`Invalid content: ${validation.reason}`);
        }

        //The actual puzzle generation step after passing validation
        const puzzlePrompt = `You are generating a memory puzzle for a personal time-capsule journal app. Based on the following content created by the user, create a puzzle that only their future self could solve. It should be a test of their memory.
        User's journal entry: "${content}" 

        User's skill level: ${userProfile.skillLevel}
        
        First, extract concrete facts from the entry such as:
        -activities they did (verbs)
        -objects they mentioned (things, places, people)
        -outcomes (results, achievements, failures)

        Second, create one puzzle using those facts.

        There are two possible types of puzzles you can create:

        Puzzle Type #1) Trivia (Specific memory recall): Ask about a concrete fact or relationship between facts. Put an emphasis on recalling their actions and related nouns than numbers.
        Examples: combine two events, ask for a number, ask what object/event matches another event, ask cause/effect from the same day

        Puzzle Type #2) Reflection (Personal growth): Ask what they learned, realized, or how they felt about a specific event from that day.
        You should reference a specific real event from their entry.

        Rules:
        -Don't introduce new activities or objects in the entry
        -Don't ask generic life advice questions
        -It is helpful to reference multiple events/facts from the entry when possible, to distinguish similar entries from each other
        -Keep the question concise and clear
        Hints should reference the original content but not reveal the answer

        Use your judgement to determine which type of question would be more engaging and meaningful for the user based on the content of their entry.

        Use their skill level to aid in the complexity of your question.
        
        Return a valid JSON in the following format:
        {
            "type": "trivia" | "reflection",
            "question": "string",
            "difficulty": "easy" | "medium" | "hard",
            "hints": ["hint1", "hint2"],
        }

        Return only valid JSON, no other text.`;
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {role: 'system', content: 'You are a puzzle generator for a time capsule journal app. Return only valid JSON.'},
                {role: 'user', content: puzzlePrompt}
            ],
            temperature: 0.7,
            response_format: {type: 'json_object'}
        });

        const puzzleData = JSON.parse(response.choices[0].message.content);
        return puzzleData;
    } catch (error) {
        console.error('OpenAI error:', error);

        if  (error.message.startsWith('Invalid content:')) {
            throw error;
        }

        throw new Error('Failed to generate puzzle');
    }
};

const validateAnswer = async (question, userAnswer, originalContent) => {
    try {
        const prompt = `You are evaluating whether a user has correctly answered trivia about their entry or demonstrated personal growth within a reasonable degree.
        
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