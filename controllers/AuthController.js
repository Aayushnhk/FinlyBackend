import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
const prismaClient = new PrismaClient();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper function to check password complexity
const isPasswordComplex = (password) => {
    const hasNumber = /[0-9]/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    return password.length >= 8 && hasNumber && hasLetter;
};

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'First name, Last name, Email and password are required' });
    }

    if (!isPasswordComplex(password)) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters long and contain both numbers and letters.',
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prismaClient.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({
            id: user.id, // User ID is now a string (ObjectId)
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt,
        });
    } catch (error) {
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Could not register user' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await prismaClient.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        res.json({ token, expiresIn: " 1hour", assignedTime: currentTime, userId: user.id }); // Include userId in the response
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Could not log in' });
    }
});

export default router;