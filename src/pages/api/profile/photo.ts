import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = "secretKey";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Метод не разрешен" });
  }

  const { photoUrl } = req.body;

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Токен отсутствует" });
  }

  try {
    const decodeToken = jwt.verify(token, JWT_SECRET) as { userId: number };

    const updateProfile = await prisma.profile.update({
      where: { id: decodeToken.userId },
      data: { photoUrl },
    });

    res.status(200).json({ message: "Фото обновлено", profile: updateProfile });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Ошибка сервера" });
  }
}
