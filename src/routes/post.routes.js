import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"; 
import { upload } from "../middlewares/multer.middleware.js";

import {
    createPost,
    createPoll,
    createPromotion,
    getAllFeed,
    toggleLike,
    addComment,
    voteInPoll,
    toggleShare
} from "../Controller/post.controller.js";


const router = Router()

router.route("/").get(verifyJWT, getAllFeed); //tested
router.route("/create-post").post(verifyJWT, upload.single("image"), createPost);  //tested
router.route("/create-poll").post(verifyJWT, createPoll);     //tested
router.route("/create-promotion").post(verifyJWT, upload.single("image"), createPromotion); //tested
router.route("/:postId/toggle-like").post(verifyJWT, toggleLike); //tested
router.route("/:postId/add-comment").post(verifyJWT, addComment); //tested
router.route("/:postId/vote").post(verifyJWT, voteInPoll);  //tested
router.route("/:postId/toggle-share").post(verifyJWT, toggleShare); //tested

export default router;
