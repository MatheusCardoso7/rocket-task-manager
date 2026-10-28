import { Router } from "express"

import { TaskHistoryController } from "@/controllers/task-history-controller"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"
import { verifyUserAuthorization } from "@/middlewares/verifyUserAuthorization"

const taskHistoryRoutes = Router()
const taskHistoryController = new TaskHistoryController()

taskHistoryRoutes.use(ensureAuthenticated, verifyUserAuthorization(["admin"]))
taskHistoryRoutes.get("/:taskId", taskHistoryController.index)

export { taskHistoryRoutes }
