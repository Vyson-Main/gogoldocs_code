// ── Express App ───────────────────────────────────────────────────────────────
import express    from 'express';
import cors       from 'cors';
import helmet     from 'helmet';
import morgan     from 'morgan';
import rateLimit  from 'express-rate-limit';

import { env }          from './config/env.js';
import { connectDB }    from './database/pool.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes       from './routes/authRoutes.js';
import noteRoutes       from './routes/noteRoutes.js';

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allows requests from your Vercel frontend URL set in CLIENT_ORIGIN env var.
// Also allows any *.vercel.app subdomain for preview deployments.
const allowedOrigins = [
  env.CLIENT_ORIGIN,
  /\.vercel\.app$/,
];

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
  },
  credentials: true,
}));

// ── Security & logging ────────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/',     rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20  }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/notes', noteRoutes);
app.get ('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function bootstrap() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`[Server] Running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});

export default app;
