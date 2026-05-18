/**
 * @file auth.service.ts
 * @description Core data access abstractions for User profiles.
 */

import { prisma } from "../lib/prisma.js";

interface CreateUserInput {
  username: string;
  email: string;
  passwordHash: string;
}

export const createUser = async ({
  username,
  email,
  passwordHash,
}: CreateUserInput) => {
  return await prisma.user.create({
    data: { username, email, passwordHash },
  });
};

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, createdAt: true },
  });
};
