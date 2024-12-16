import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";

const JWT_SECRET = "secretKey";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Метод не разрешен!" });
  }

  const { email, password } = req.body;

  try {
    loginSchema.parse({ email, password });
  } catch (error: any) {
    return res.status(400).json({ message: "Некорректные данные", errors: error.errors });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
}
