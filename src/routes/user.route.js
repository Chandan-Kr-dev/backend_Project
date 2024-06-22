import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router=Router()

router.route("/register").post(registerUser)//yaha aane ke baaad regster wala method call ho jayega agar register pe click krega to 


export default router