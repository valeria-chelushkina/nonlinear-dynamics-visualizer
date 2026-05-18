/**
 * @file auth.service.ts
 * @description Class-based service isolating User profile data access layers.
 */

import type { PrismaClient } from "@prisma/client";

export interface CreateUserInput {
  username: string;
  email: string;
  passwordHash: string;
}

export class AuthService {
  constructor(private readonly prisma: PrismaClient) {}

  public async createUser({ username, email, passwordHash }: CreateUserInput) {
    return await this.prisma.user.create({
      data: { username, email, passwordHash },
    });
  }

  public async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  public async findUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, createdAt: true },
    });
  }
}