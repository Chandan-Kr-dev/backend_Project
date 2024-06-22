import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


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


export default router