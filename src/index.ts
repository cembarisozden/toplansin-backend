process.on("uncaughtException",  err => {
  console.error("💥 uncaughtException:", err);
  process.exit(1);
});
process.on("unhandledRejection", err => {
  console.error("💥 unhandledRejection:", err);
  process.exit(1);
});

console.log("🟢 index.ts reached top");



import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routeUser from './routes/users';
import routeAuth from './routes/auth';
import routeHaliSaha from './routes/haliSaha';
import routeReservation from './routes/reservation';
import routeReview from './routes/review';
import logger from './core/logger/logger';
import { globalLimiter } from './middlewares/rateLimiter';

console.log("🚀 Starting Toplansın backend...");

// .env yükle
dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

// kritik değişkenler kontrolü
if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  console.error("❌ Missing .env variables: DATABASE_URL or JWT_SECRET");
  process.exit(1); // railway deploy burada çakılır
}

const app = express();

app.use(cors());

app.use(globalLimiter);
app.use(morgan('combined', {
  stream: {
    write: (msg: string) => logger.info(msg.trim())
  }
}));
app.use(express.json());

console.log("✅ Middleware'ler yüklendi");

app.use('/api', routeUser);
app.use('/api', routeAuth);
app.use('/api', routeHaliSaha);
app.use('/api', routeReservation);
app.use('/api', routeReview);

app.get('/', (req, res) => {
  res.send('Toplansin backend runliyo');
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🎧 Server listening on http://0.0.0.0:${PORT}`);
});
