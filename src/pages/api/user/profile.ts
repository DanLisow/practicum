import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = "secretKey";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Метод не разрешен" });
  }

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Нет токена авторизации" });
  }

  try {
    const decodeToken = jwt.verify(token, JWT_SECRET) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decodeToken.userId },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Пользователя не существует" });
    }

    return res.status(200).json({ email: user.email, role: user.role, profile: user.profile });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Ошибка сервера" });
  }
}
