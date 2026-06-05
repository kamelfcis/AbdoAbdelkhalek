import { Router, type RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import {
  createUser,
  createPasswordResetToken,
  findUserByEmail,
  findUserById,
  invalidatePasswordResetToken,
  updatePassword,
  verifyPassword,
  verifyPasswordResetToken,
} from './user.repository.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './jwt.js';
import type { AuthRequest } from '../../../common/middleware/auth.js';
import { requireAuth } from '../../../common/middleware/auth.js';
import { validateBody } from '../../../common/middleware/validate.js';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from '../../../common/validation/auth-schemas.js';
import { sendPasswordResetEmail } from '../../../infrastructure/email/mailer.js';
import { logger } from '../../../infrastructure/logging/logger.js';
import { env } from '../../../config/env.js';

const router = Router();

const GENERIC_RESET_MESSAGE =
  'If an account exists for that email, a reset link has been sent.';

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 30 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
}) as unknown as RequestHandler;

const forgotPasswordRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
}) as unknown as RequestHandler;

router.post('/login', authRateLimit, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
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
    const refreshDays = rememberMe ? env.rememberMeExpiresDays : env.refreshExpiresDays;
    const payload = { sub: user.id, email: user.email, isCoach: user.isCoach };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(user.id, refreshDays);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshDays * 24 * 60 * 60 * 1000,
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

router.post(
  '/forgot-password',
  forgotPasswordRateLimit,
  validateBody(forgotPasswordSchema),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await findUserByEmail(email);
      if (user) {
        const rawToken = await createPasswordResetToken(user.id);
        try {
          await sendPasswordResetEmail(user.email, rawToken);
        } catch (e) {
          logger.error({
            msg: 'Failed to send password reset email',
            email: user.email,
            err: e instanceof Error ? e.message : String(e),
          });
        }
      }
      res.json({ message: GENERIC_RESET_MESSAGE });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/reset-password',
  authRateLimit,
  validateBody(resetPasswordSchema),
  async (req, res, next) => {
    try {
      const { token, password } = req.body;
      let valid: Awaited<ReturnType<typeof verifyPasswordResetToken>> = null;
      try {
        valid = await verifyPasswordResetToken(token);
      } catch (lookupErr) {
        logger.error({
          msg: 'Password reset token lookup failed',
          err: lookupErr instanceof Error ? lookupErr.message : String(lookupErr),
        });
        res.status(400).json({ error: 'Invalid or expired reset token' });
        return;
      }
      if (!valid) {
        res.status(400).json({ error: 'Invalid or expired reset token' });
        return;
      }
      const hashed = await bcrypt.hash(password, 12);
      await updatePassword(valid.userId, hashed);
      await invalidatePasswordResetToken(valid.id);
      res.json({ message: 'Password updated successfully' });
    } catch (e) {
      next(e);
    }
  }
);

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
