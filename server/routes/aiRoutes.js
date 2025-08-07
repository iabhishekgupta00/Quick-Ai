import express from "express";
import { generateArticle, generateBlogTitle, generateImage, removeBackgroundImage, removeObject, reviewResume } from "../controllers/aiController.js";
import { auth } from "../middlewares/auth.js";
import { upload } from "../configs/multr.js";

const aiRouter = express.Router();

aiRouter.post("/generate-article",auth, generateArticle);
aiRouter.post("/generate-blog-titles",auth, generateBlogTitle);
aiRouter.post("/generate-image",auth, generateImage);
aiRouter.post("/remove-background-image",upload.single("image"),auth, removeBackgroundImage);
aiRouter.post("/remove-object",upload.single("image"),auth, removeObject);
aiRouter.post("/review-resume",upload.single("resume"),auth, reviewResume);



export default aiRouter

