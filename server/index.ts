import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
const { Pool } = pg;
import { PrismaPg } from '@prisma/adapter-pg';

console.log('=== Starting Server Initialization ===');

const app = express();

if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not defined in .env file');
    process.exit(1);
}

// Set up PostgreSQL pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PORT = 3000;

app.use(cors());
app.use(express.json());


// Route to check if server works
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Save some parameters of a preset
app.post('/api/presets', async (req, res) => {
    try {
        const { name, systemType, parameters, userId } = req.body;
        const newPreset = await prisma.preset.create({
            data: {
                name,
                systemType,
                parameters,
                userId
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
        const allPresets = await prisma.preset.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(allPresets);
    } catch(error) {
        res.status(500).json({ error: 'Failed to fetch presets' })
    }
})


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


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
