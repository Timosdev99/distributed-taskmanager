import { gettask, Createtask, assignuser, deleteuser, updatetask } from "../controllers/taskcontroller";
import { Router } from "express";

const router = Router()

router.get("/getTask", gettask);
router.post("/Createtask", Createtask);
router.delete("/deleteuser", deleteuser)
router.patch("/assignuser", assignuser)
router.patch("/updatetask", updatetask)
export default router