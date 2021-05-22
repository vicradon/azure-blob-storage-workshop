import { Router } from "express";
import imageUploadController from "../controllers/image-upload.js";
import multer from "multer";
const router = Router();
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single("image");

router.get("/", imageUploadController.index);
router.post("/", uploadStrategy, imageUploadController.upload);

export default router;
