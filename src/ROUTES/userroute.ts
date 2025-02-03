import { signUp, login, allUser,  getUser } from "../controllers/usercontroller";
import { Router } from "express";
import { authToken } from "../middleware/auth";
const router = Router()

router.post("/SignUp", signUp)
router.post("/login", login)
router.get("/getuser/:id", authToken, getUser)
router.get("/alluser", authToken, allUser)
export default router