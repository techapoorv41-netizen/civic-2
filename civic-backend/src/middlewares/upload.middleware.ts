import multer from "multer";
import env from "../config/env";
import AppError from "../errors/AppError";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const memoryStorage = multer.memoryStorage();

export const uploadSingle = multer({
  storage: memoryStorage,
  limits: {
    fileSize: env.UPLOAD_MAX_MB * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(422, "VALIDATION_ERROR", "Only jpeg, png, and webp images are allowed"));
    }
  },
}).single("file");

export default uploadSingle;
