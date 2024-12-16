import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Отсутствует токен" });
  }

  try {
    const user = verifyToken(token);

    if (user.role !== "EMPLOYER") {
      return res.status(403).json({ message: "Запрещено" });
    }

    if (req.method === "GET") {
      const vacancies = await prisma.vacancy.findMany({
        where: { employerId: user.userId },
        include: {
          applications: {
            include: {
              student: {
                select: {
                  profile: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      const formattedVacancies = vacancies.map((vacancy) => ({
        id: vacancy.id,
        title: vacancy.title,
        description: vacancy.description,
        salary: vacancy.salary,
        createdAt: vacancy.createdAt,
        applications: vacancy.applications
          ? vacancy.applications.map((application) => ({
              id: application.id,
              studentId: application.studentId,
              studentName: application.student?.profile?.name || "Имя не указано",
              resume: application.resume,
              status: application.status,
              createdAt: application.createdAt,
            }))
          : [],
      }));

      return res.status(200).json({ vacancies: formattedVacancies });
    }

    if (req.method === "POST") {
      const { title, description, salary } = req.body;

      const parsedSalary = parseFloat(salary);
      if (isNaN(parsedSalary)) {
        return res.status(400).json({ message: "Некорректная зарплата" });
      }

      const vacancy = await prisma.vacancy.create({
        data: {
          title: title,
          description: description,
          salary: parsedSalary,
          employerId: user.userId,
        },
      });

      return res.status(201).json(vacancy);
    }

    if (req.method === "DELETE") {
      const vacancyId = parseInt(req.query.id as string);
      if (!vacancyId) {
        return res.status(400).json({ message: "ID вакансии не указан" });
      }

      const vacancy = await prisma.vacancy.delete({
        where: { id: vacancyId },
      });
      res.status(200).json(vacancy);
    }
  } catch (error: any) {
    console.error("Ошибка на сервере:", error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
}
