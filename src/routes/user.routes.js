import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"; //middleware not using right now but will be used later when we want to protect the routes

const router = Router()

import { registerUser, loginUser, refreshAccessToken, logoutUser, getCurrentUser} from "../Controller/user.contoller.js";

router.route("/register").post(registerUser);//tested
router.route("/login").post(loginUser);//tested
router.route("/refresh-token").post(refreshAccessToken);//tested
//secured routes

router.route("/logout").get( logoutUser);//tested
router.route("/profile").get(getCurrentUser);//tested

export default router;