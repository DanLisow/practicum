import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Метод не поддерживается" });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Не авторизован" });
  }

  try {
    const decoded = verifyToken(token); // Проверка токена
    const studentId = decoded.userId;

    // Получаем список уведомлений студента
    const notifications = await prisma.notification.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ notifications });
  } catch (error: any) {
    console.error("Ошибка получения уведомлений:", error.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
