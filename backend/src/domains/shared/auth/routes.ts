import { Router, type RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
} from './user.repository.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './jwt.js';
import type { AuthRequest } from '../../../common/middleware/auth.js';
import { requireAuth } from '../../../common/middleware/auth.js';
import { validateBody } from '../../../common/middleware/validate.js';
import { loginSchema, signupSchema } from '../../../common/validation/auth-schemas.js';

const router = Router();

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 30 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
}) as unknown as RequestHandler;

router.post('/login', authRateLimit, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user?.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const payload = { sub: user.id, email: user.email, isCoach: user.isCoach };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(user.id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      accessToken,
      user: { id: user.id, email: user.email, fullName: user.fullName, isCoach: user.isCoach },
    });
  } catch (e) {
    next(e);
  }
});

router.post('/signup', authRateLimit, validateBody(signupSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const existing = await findUserByEmail(data.email);
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    const password = await bcrypt.hash(data.password, 12);
    const user = await createUser({
      email: data.email,
      password,
      fullName: data.fullName,
      phone: data.phone,
      isCoach: false,
      registeredFrom: data.registeredFrom,
    });
    res.status(201).json({
      message: 'Account created',
      user: { id: user.id, email: user.email, fullName: user.fullName },
    });
  } catch (e) {
    next(e);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
      res.status(401).json({ error: 'No refresh token' });
      return;
    }
    const { sub } = verifyRefreshToken(token);
    const user = await findUserById(sub);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    const payload = { sub: user.id, email: user.email, isCoach: user.isCoach };
    res.json({ accessToken: signAccessToken(payload) });
  } catch (e) {
    next(e);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('refreshToken');
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await findUserById(req.user!.sub);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        isCoach: user.isCoach,
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
