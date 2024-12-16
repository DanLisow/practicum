import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Метод не поддерживается" });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Не авторизован" });
  }

  try {
    const decoded = verifyToken(token);
    const employerId = decoded.userId;
    const { applicationId, status } = req.body;

    if (!applicationId || !status) {
      return res.status(400).json({ message: "Не указаны applicationId или status" });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { vacancy: true },
    });

    if (!application || application.vacancy.employerId !== employerId) {
      return res.status(404).json({ message: "Заявка не найдена или у вас нет доступа" });
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    await prisma.notification.create({
      data: {
        userId: application.studentId,
        message:
          status === "APPROVED"
            ? `Ваша заявка на вакансию "${application.vacancy.title}" принята`
            : `Ваша заявка на вакансию "${application.vacancy.title}" отклонена`,
        isRead: false,
      },
    });

    res.status(200).json({ message: "Статус заявки обновлён и уведомление отправлено" });
  } catch (error: any) {
    console.error("Ошибка обработки заявки:", error.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
