import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Метод не разрешен" });
  }

  const { email, password, role, name, phone } = req.body;

  console.log(req.body);

  if (!email || !password || !role || !name || !phone) {
    return res.status(400).json({ message: "Заполните обязательные поля" });
  }

  try {
    const userExist = await prisma.user.findUnique({
      where: { email },
    });

    if (userExist) {
      return res.status(409).json({ message: "Пользователь уже существует" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashPassword,
        role: role,
        profile: {
          create: {
            name: name,
            phone: phone,
          },
        },
      },
    });

    return res.status(201).json({ message: "Регистрация успешна", user });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Ошибка сервера" });
  }
}
