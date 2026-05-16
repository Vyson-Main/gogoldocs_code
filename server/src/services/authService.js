// ── Auth Service (Server) ─────────────────────────────────────────────────────
import bcrypt from 'bcrypt';
import jwt    from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { env }       from '../config/env.js';
import { ApiError }  from '../utils/ApiError.js';

const SALT_ROUNDS = 12;

function signToken(userId) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

function sanitize(u) {
  return { id: u.id, email: u.email, createdAt: u.createdAt };
}

export const authService = {
  async register(email, password) {
    const existing = await UserModel.findByEmail(email);
    if (existing) throw ApiError.conflict('Email already in use');
    const hash  = await bcrypt.hash(password, SALT_ROUNDS);
    const user  = await UserModel.create(email, hash);
    const token = signToken(user.id);
    return { user: sanitize(user), token };
  },

  async login(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user) throw ApiError.unauthorized('Invalid email or password');
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)  throw ApiError.unauthorized('Invalid email or password');
    const token = signToken(user.id);
    return { user: sanitize(user), token };
  },

  async me(userId) {
    const user = await UserModel.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return sanitize(user);
  },
};
