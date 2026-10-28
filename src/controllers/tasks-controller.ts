import { Request, Response } from "express"
import { AppError } from "@/utils/AppError"
import { prisma } from "@/database/prisma"
import { z } from "zod"

class TasksController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      title: z.string().trim().min(3).max(150),
      description: z.string().trim().min(3),
      assignedTo: z.uuid(),
      teamId: z.uuid(),
    })

    const { title, description, assignedTo, teamId } = bodySchema.parse(
      request.body,
    )

    const user = await prisma.user.findUnique({
      where: { id: assignedTo },
    })

    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    const team = await prisma.teams.findUnique({
      where: { id: teamId },
    })

    if (!team) {
      throw new AppError("Time não encontrado", 404)
    }

    const teamMember = await prisma.teamsMembers.findFirst({
      where: {
        teamId,
        userId: assignedTo,
      },
    })

    if (!teamMember) {
      throw new AppError("Usuário não pertence a esse time", 400)
    }

    const task = await prisma.tasks.create({
      data: {
        title,
        description,
        assignedTo,
        teamId,
      },
    })

    return response.status(201).json(task)
  }

  async index(request: Request, response: Response) {
    const paramsSchema = z.object({
      teamId: z.uuid(),
    })

    const { teamId } = paramsSchema.parse(request.params)

    const team = await prisma.teams.findUnique({
      where: { id: teamId },
    })

    if (!team) {
      throw new AppError("Time não encontrado", 404)
    }

    const tasks = await prisma.tasks.findMany({
      where: {
        teamId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    return response.json(tasks)
  }

  async show(request: Request, response: Response) {
    const paramsSchema = z.object({
      userId: z.uuid(),
    })

    const { userId } = paramsSchema.parse(request.params)
    const { id: authenticatedUserId, role } = request.user!

    if (role !== "admin" && userId !== authenticatedUserId) {
      throw new AppError("Acesso não autorizado", 403)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    const userTasks = await prisma.tasks.findMany({
      where: {
        assignedTo: userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    return response.json(userTasks)
  }

  async filter(request: Request, response: Response) {
    const querySchema = z.object({
      status: z.enum(["pending", "inProgress", "done"]).optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
    })

    const { status, priority } = querySchema.parse(request.query)
    const { id: authenticatedUserId, role } = request.user!

    const tasks = await prisma.tasks.findMany({
      where: {
        ...(role === "member" && {
          assignedTo: authenticatedUserId,
        }),
        ...(status && { status }),
        ...(priority && { priority }),
      },
    })

    return response.json(tasks)
  }

  async update(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const bodySchema = z.object({
      title: z.string().trim().min(1).max(150).optional(),
      description: z.string().trim().min(1).optional(),
      status: z.enum(["pending", "inProgress", "done"]).optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
      assignedTo: z.uuid().optional(),
      teamId: z.uuid().optional(),
    })

    const { id } = paramsSchema.parse(request.params)
    const { title, description, status, priority, assignedTo, teamId } =
      bodySchema.parse(request.body)
    const { id: changedBy } = request.user!

    const currentTask = await prisma.tasks.findUnique({
      where: { id },
    })

    if (!currentTask) {
      throw new AppError("Task não encontrada", 404)
    }

    const finalTeamId = teamId ?? currentTask.teamId
    const finalAssignedTo = assignedTo ?? currentTask.assignedTo

    const team = await prisma.teams.findUnique({
      where: { id: finalTeamId },
    })

    if (!team) {
      throw new AppError("Time não encontrado", 404)
    }

    const user = await prisma.user.findUnique({
      where: { id: finalAssignedTo },
    })

    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    const statusChanged = status !== undefined && status !== currentTask.status

    const updatedTask = await prisma.tasks.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        status,
        priority,
        assignedTo,
        teamId,
      },
    })

    if (statusChanged) {
      await prisma.tasksHistory.create({
        data: {
          taskId: id,
          changedBy,
          oldStatus: currentTask.status,
          newStatus: status!,
        },
      })
    }

    return response.json(updatedTask)
  }

  async remove(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const task = await prisma.tasks.findUnique({
      where: { id },
    })

    if (!task) {
      throw new AppError("Task não encontrada", 404)
    }

    await prisma.tasks.delete({
      where: {
        id,
      },
    })

    return response.status(204).send()
  }
}

export { TasksController }
