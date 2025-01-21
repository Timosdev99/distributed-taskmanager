import { gettask, Createtask } from "../controllers/taskcontroller";
import { Router } from "express";

const router = Router()

router.get("/getTask", gettask);
router.post("/Createtask", Createtask);

export default router