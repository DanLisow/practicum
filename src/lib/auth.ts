import jwt from "jsonwebtoken";

const JWT_SECRET = "secretKey";

interface Token {
  userId: number;
  role: string;
  iat: number;
  exp: number;
}

export function verifyToken(token: string): Token {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Token;
    return decoded;
  } catch (error) {
    throw new Error("Неверный токен");
  }
}
