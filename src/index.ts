import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import routeUser from './routes/users';
import routeAuth from './routes/auth';
import routeHaliSaha from './routes/haliSaha';
import routeReservation from './routes/reservation';

dotenv.config();
const prisma = new PrismaClient();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
console.log("✅ Morgan aktif"); // Bunu terminalde görüyor musun?
app.use('/api',routeUser)
app.use('/api',routeAuth)
app.use('/api',routeHaliSaha)
app.use('/api',routeReservation)



app.get('/', (req, res) => {
    res.send('Toplansin backend runliyo');
});
app.listen(PORT, () => {
console.log(`Server listening on http://localhost:${PORT}`);
});