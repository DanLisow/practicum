import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { promisify } from "util";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads/resume",
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
}).single("file");

const uploadMiddleware = promisify(upload);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Метод не разрешен" });
  }

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(201).json({ message: "Токен отсутствует" });
  }

  try {
    await uploadMiddleware(req as any, res as any);

    const file = req.file;
    const { resumeName } = req.body;
    const decoded = verifyToken(token);

    if (!file) {
      return res.status(400).json({ message: "Файл не найден" });
    }

    const fileUrl = `/uploads/resume/${file.filename}`;

    const newResume = await prisma.resume.create({
      data: {
        studentId: decoded.userId,
        content: fileUrl,
        resumeName: resumeName,
      },
    });

    res.status(201).json(newResume);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
}
