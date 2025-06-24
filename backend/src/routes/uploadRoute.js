import express from "express";
import { uploadProfilePicture } from "../controllers/blobController.js";

const router = express.Router();

router.post("/upload-profile-picture", uploadProfilePicture);

export default router;
