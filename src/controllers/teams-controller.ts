import { Request, Response } from "express"
import { AppError } from "@/utils/AppError"
import { prisma } from "@/database/prisma"
import { z } from "zod"

class TeamsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(1).max(100),
      description: z.string(),
    })

    const { name, description } = bodySchema.parse(request.body)

    const team = await prisma.teams.create({
      data: {
        name,
        description,
      },
    })

    return response.status(201).json(team)
  }

  async index(request: Request, response: Response) {
    const teams = await prisma.teams.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
    })

    return response.json(teams)
  }

  async update(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const bodySchema = z.object({
      name: z.string().trim().min(1).max(100),
      description: z.string(),
    })

    const { id } = paramsSchema.parse(request.params)
    const { name, description } = bodySchema.parse(request.body)

    const team = await prisma.teams.findUnique({
      where: { id },
    })

    if (!team) {
      throw new AppError("Time não encontrado", 404)
    }

    const updatedTeam = await prisma.teams.update({
      data: {
        name,
        description,
      },
      where: {
        id,
      },
    })

    return response.json(updatedTeam)
  }

  async remove(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const team = await prisma.teams.findUnique({
      where: { id },
    })

    if (!team) {
      throw new AppError("Time não encontrado", 404)
    }

    await prisma.teams.delete({
      where: {
        id,
      },
    })

    return response.status(204).send()
  }
}

export { TeamsController }
