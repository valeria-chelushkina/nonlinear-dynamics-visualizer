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

// Some test routes to check if server works

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/presets', async (req, res) => {
    try {
        const presets = await prisma.preset.findMany({
            where: { isPublic: true },
            include: { user: { select: { username: true } } }
        });
        res.json(presets);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch presets' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
