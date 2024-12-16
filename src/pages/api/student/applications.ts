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
    const decoded = verifyToken(token);
    const studentId = decoded.userId;

    const applications = await prisma.application.findMany({
      where: { studentId },
      include: {
        vacancy: {
          select: { title: true },
        },
      },
    });

    const formattedApplications = applications.map((application) => ({
      id: application.id,
      vacancyTitle: application.vacancy.title,
      status: application.status,
      createdAt: application.createdAt,
    }));

    res.status(200).json({ applications: formattedApplications });
  } catch (error: any) {
    console.error("Ошибка получения заявок:", error.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
