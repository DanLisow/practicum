import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Нет токена авторизации" });
    }

    try {
      const vacancies = await prisma.vacancy.findMany();
      res.status(200).json({ vacancies });
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера" });
    }
  } else {
    res.status(405).json({ message: "Метод не поддерживается" });
  }
}
