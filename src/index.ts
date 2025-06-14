import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import routeUser from './routes/users';
import routeAuth from './routes/auth';

dotenv.config();
const prisma = new PrismaClient();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());
app.use('/api',routeUser)
app.use('/api',routeAuth)

app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Toplansin backend runliyo');
});
app.listen(PORT, () => {
    console.log('Server listening on http://localhost:${PORT}');
});
