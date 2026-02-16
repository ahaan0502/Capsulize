export interface User {
    id: string;
    email: string;
    profile?: {
        skillLevel?: 'beginner' | 'intermediate' | 'advanced';
    };
}

export interface Puzzle {
    type: 'trivia' | 'reflection';
    question: string;
    difficulty: 'easy' | 'medium' | 'hard';
    hints: string[];
    expectedAnswer?: string | null;
}

export interface Capsule {
    _id: string;
    content?: string;
    puzzle: Puzzle;
    unlockDate: string;
    isUnlocked: boolean;
    unlockedAt?: string;
    unlockAttempts: number;
    createdAt: string;
}

export interface AuthResponse {
    message: string,
    token: string,
    user: User;
}