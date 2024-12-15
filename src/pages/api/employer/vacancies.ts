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
    console.log(user);

    if (user.role !== "EMPLOYER") {
      return res.status(403).json({ message: "Запрещено" });
    }

    if (req.method === "GET") {
      const vacancies = await prisma.vacancy.findMany({
        where: { employerId: user.userId },
      });

      return res.status(200).json({ vacancies });
    }

    if (req.method === "POST") {
      const { title, description, salary } = req.body;

      console.log(req.body);

      const vacancy = await prisma.vacancy.create({
        data: {
          title: title,
          description: description,
          salary: parseFloat(salary),
          employerId: user.userId,
        },
      });

      return res.status(201).json(vacancy);
    }

    if (req.method === "DELETE") {
      const vacancyId = parseInt(req.query.id as string);
      const vacancy = await prisma.vacancy.delete({
        where: { id: vacancyId },
      });
      res.status(200).json(vacancy);
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Ошибка сервера" });
  }
}
