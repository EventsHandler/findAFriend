import type { MutationResolvers } from './../../../types.generated.js'
import { prisma } from '../../../../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const login: NonNullable<MutationResolvers['login']> = async (_parent, { name, password }) => {
  const user = await prisma.user.findUnique({
    where: { name },
  });

  if (!user) {
    throw new Error('No such user found');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);

  return {
    token,
    user,
  };
};
