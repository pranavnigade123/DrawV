// lib/middleware/auth.ts
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type Token = {
  email?: string | null;
  role?: string;
  id?: string;
} | null;

export async function getUserToken(req: NextRequest): Promise<Token> {
  return (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as Token;
}

export function isAuthenticated(token: Token) {
  return !!token;
}

export function isAdmin(token: Token) {
  return token?.role === "admin";
}
