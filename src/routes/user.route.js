import { Router } from "express";
import { registerUser,loginUser,logoutUser,refreshAccessToken  } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avtar",
            maxCount:1,
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)//yaha aane ke baaad regster wala method call ho jayega agar register pe click krega to 

router.route("/login").post(loginUser)

//secured routes 
router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-Token").post(refreshAccessToken)

export default router