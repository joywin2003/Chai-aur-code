import { Router } from "express";
import { RegisterUser } from "../controllers/user.controller.js";
import {upload} from "../middlewires/multer.middleware.js"
import { verifyJWT } from "../middlewires/auth.middleware.js";
import { LoginUser,LogoutUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    RegisterUser
    );

router.route("/login").post(LoginUser);
router.route("/logout").post(verifyJWT, LogoutUser);

export default router;
