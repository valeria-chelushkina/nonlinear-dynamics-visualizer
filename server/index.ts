import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
const { Pool } = pg;
import { PrismaPg } from '@prisma/adapter-pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}


console.log('=== Starting Server Initialization ===');

const databaseUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;

const app = express();

if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL is not defined in .env file');
    process.exit(1);
}

if(!jwtSecret) {
    console.error('ERROR: JWT_SECRET is not defined in .env file');
    process.exit(1);
}

// Set up PostgreSQL pool
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PORT = 3000;

app.use(cors());
app.use(express.json());

// Middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) {
        return res.status(401).json({ error: 'No token provided.'});
    }
    try{
        const decoded = jwt.verify(token, jwtSecret as string);
        req.userId = (decoded as any).userId;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token'});
    }
};

// Route to check if server works
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Save some parameters of a preset
app.post('/api/presets', authenticate, async (req, res) => {
    try {
        const { name, systemType, parameters, isPublic, cameraConfig } = req.body;
        const newPreset = await prisma.preset.create({
            data: {
                name,
                systemType,
                parameters,
                isPublic,
                cameraConfig,
                userId: req.userId! // taken from token
            }
        });

        res.status(201).json(newPreset);
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: 'Failed to save a preset' });
    }
});

// Get all presets - from newest to oldest
app.get('/api/presets', async (req, res) => {
    try{
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        let requesterId: string | undefined;

        if (token) {
            try {
                const decoded = jwt.verify(token, jwtSecret as string);
                requesterId = (decoded as any).userId;
            } catch (err) {
                // Ignore invalid token for listing, just treat as guest
            }
        }

        const allPresets = await prisma.preset.findMany({
            where: {
                OR: [
                    { isPublic: true },
                    { userId: requesterId || 'NONE' }
                ]
            },
            include: { user: { select: { username: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(allPresets);
    } catch(error) {
        res.status(500).json({ error: 'Failed to fetch presets' })
    }
})

// Delete a preset
app.delete('/api/presets/:id', authenticate, async (req, res) => {

    try {
        const id = req.params.id as string;
        const userId = req.userId;

        const preset = await prisma.preset.findUnique({
            where: { id: parseInt(id) }
        });

        if (!preset) {
            return res.status(404).json({ error: 'Preset not found' });
        }

        if (preset.userId !== userId) {
            return res.status(403).json({ error: 'You do not have permission to delete this preset' });
        }

        await prisma.preset.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Preset deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete preset' });
    }
});


// Route to get a seed for test user and upsert it to DB
app.get('/api/seed-user', async (req, res) => {
    try{
        const user = await prisma.user.upsert({
            where: { email: 'testEmail@test.com' },
            update: {},
            create: {
                username: 'TestUser',
                email: 'testEmail@test.com',
                passwordHash: 'just-for-test-hash'
            }
        });
        res.json({ message: 'Test user is ready.', userId: user.id});
    } catch(error) {
        if(error instanceof Error)
            res.status(500).json({ error: error.message });
        else
            res.status(500).json({ error: 'An unknown error occured.' });
    }
});


// Get presets for a specific user
app.get('/api/users/:userId/presets', async (req, res) => {
    try {
        const { userId } = req.params;
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        let requesterId: string | undefined;

        if (token) {
            try {
                const decoded = jwt.verify(token, jwtSecret as string);
                requesterId = (decoded as any).userId;
            } catch (err) {
                // Skip
            }
        }

        const presets = await prisma.preset.findMany({
            where: {
                userId: userId,
                OR: requesterId === userId ? undefined : [
                    { isPublic: true }
                ]
            },
            include: { user: { select: { username: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json(presets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user presets' });
    }
});

// Get user profile info
app.get('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, createdAt: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user info' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

// Register
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {username, email, passwordHash: hashedPassword }
        });
        res.json({ message: 'User created.'});
    } catch (err) {
        res.status(400).json({ error: 'Username or Email already exists.'});
    }
});

// Login
app.post('/api/auth/login', async(req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({where: { email }});
    if(!user || !(await bcrypt.compare(password, user.passwordHash)))
        { return res.status(401).json({ error: 'Email or password is incorrect.' }) };
    const token = jwt.sign({ userId: user.id}, jwtSecret, {
        expiresIn: '24h'});
        res.json({token, user: {id: user.id, username: user.username}});
});