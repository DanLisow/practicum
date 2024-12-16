import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Не авторизован" });
    }

    try {
      const decoded = verifyToken(token);
      const studentId = decoded.userId;

      const resumes = await prisma.resume.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json({ resumes });
    } catch (error: any) {
      console.error("Ошибка получения резюме:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  } else {
    res.status(405).json({ message: "Метод не поддерживается" });
  }
}