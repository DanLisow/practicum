import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Токен отсутствует" });
    }

    try {
      const decoded = verifyToken(token);
      const { vacancyId, resumeId } = req.body;

      if (!vacancyId || !resumeId) {
        return res.status(400).json({ message: "Необходимо указать вакансию и резюме" });
      }

      const vacancy = await prisma.vacancy.findUnique({
        where: { id: vacancyId },
      });
      if (!vacancy) {
        return res.status(404).json({ message: "Вакансия не найдена" });
      }

      const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
      });
      if (!resume) {
        return res.status(404).json({ message: "Резюме не найдено" });
      }

      const application = await prisma.application.create({
        data: {
          studentId: decoded.userId,
          vacancyId,
          resume: resume.content,
        },
      });

      res.status(201).json(application);
    } catch (error: any) {
      console.error("Ошибка подачи заявки:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  } else {
    res.status(405).json({ message: "Метод не поддерживается" });
  }
}
