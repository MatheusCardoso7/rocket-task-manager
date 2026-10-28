import { Router } from "express"

import { usersRoutes } from "./users-routes"
import { teamsRoutes } from "./teams-routes"
import { tasksRoutes } from "./tasks-routes"
import { sessionsRoutes } from "./sessions-routes"
import { teamMembersRoutes } from "./team-members-routes"
import { taskHistoryRoutes } from "./task-history-routes"

const routes = Router()
routes.use("/users", usersRoutes)
routes.use("/teams", teamsRoutes)
routes.use("/tasks", tasksRoutes)
routes.use("/sessions", sessionsRoutes)
routes.use("/team-members", teamMembersRoutes)
routes.use("/task-history", taskHistoryRoutes)

export { routes }
