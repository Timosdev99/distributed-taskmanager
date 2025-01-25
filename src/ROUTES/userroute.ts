import { signUp, login } from "../controllers/usercontroller";
import { Router } from "express";

const router = Router()

router.post("/SignUp", signUp)
router.post("login", login)

export default router