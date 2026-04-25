import type { MutationResolvers } from './../../../types.generated';
import { prisma } from '../../../../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const register: NonNullable<MutationResolvers['register']> = async (_parent, { name, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      password: hashedPassword,
    },
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);

  return {
    token,
    user,
  };
};
