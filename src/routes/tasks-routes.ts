import { Router } from "express"

import { TasksController } from "@/controllers/tasks-controller"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"
import { verifyUserAuthorization } from "@/middlewares/verifyUserAuthorization"

const tasksRoutes = Router()
const tasksController = new TasksController()

tasksRoutes.use(ensureAuthenticated)
tasksRoutes.get("/user/:userId", tasksController.show)
tasksRoutes.get("/filter", tasksController.filter)
tasksRoutes.use(verifyUserAuthorization(["admin"]))
tasksRoutes.post("/", tasksController.create)
tasksRoutes.get("/team/:teamId", tasksController.index)
tasksRoutes.patch("/:id", tasksController.update)
tasksRoutes.delete("/:id", tasksController.remove)

export { tasksRoutes }
