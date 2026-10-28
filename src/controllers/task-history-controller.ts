import { Request, Response } from "express"
import { AppError } from "@/utils/AppError"
import { prisma } from "@/database/prisma"
import { z } from "zod"

class TaskHistoryController {
  async index(request: Request, response: Response) {
    const paramsSchema = z.object({
      taskId: z.uuid(),
    })

    const { taskId } = paramsSchema.parse(request.params)

    const task = await prisma.tasks.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      throw new AppError("Task não encontrada", 404)
    }

    const taskHistory = await prisma.tasksHistory.findMany({
      where: {
        taskId,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
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

    return response.json(taskHistory)
  }
}

export { TaskHistoryController }
