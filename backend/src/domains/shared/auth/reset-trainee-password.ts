import bcrypt from 'bcryptjs';
import { AppError } from '../../../common/errors/AppError.js';
import {
  findUserById,
  invalidatePasswordResetTokens,
  updatePassword,
} from './user.repository.js';

export async function resetTraineePassword(userId: string, password: string): Promise<void> {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  if (user.isCoach) {
    throw new AppError('Cannot reset password for a coach account', 403);
  }

  const hashed = await bcrypt.hash(password, 12);
  await updatePassword(user.id, hashed);
  await invalidatePasswordResetTokens(user.id);
}
