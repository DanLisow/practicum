import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { promisify } from "util";

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

  try {
    await uploadMiddleware(req as any, res as any);

    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Файл не найден" });
    }

    const fileUrl = `/uploads/resume/${file.filename}`;
    res.status(200).json({ fileUrl });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
}
