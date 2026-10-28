import { Router } from "express"

import { TeamMembersController } from "@/controllers/team-members-controller"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"
import { verifyUserAuthorization } from "@/middlewares/verifyUserAuthorization"

const teamMembersRoutes = Router()
const teamMembersController = new TeamMembersController()

teamMembersRoutes.use(ensureAuthenticated)
teamMembersRoutes.get("/:id", teamMembersController.show)
teamMembersRoutes.use(verifyUserAuthorization(["admin"]))
teamMembersRoutes.post("/:id", teamMembersController.create)
teamMembersRoutes.delete("/:id/:userId", teamMembersController.remove)

export { teamMembersRoutes }
