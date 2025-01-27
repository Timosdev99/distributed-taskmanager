import { signUp, login } from "../controllers/usercontroller";
import { Router } from "express";
import { authToken } from "../middleware/auth";
import { getUser } from "../controllers/usercontroller";
const router = Router()

router.post("/SignUp", signUp)
router.post("/login", login)
router.get("/getuser/:id", authToken, getUser)

export default router