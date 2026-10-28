import { Request, Response } from "express"
import { AppError } from "@/utils/AppError"
import { prisma } from "@/database/prisma"
import { z } from "zod"

class TeamMembersController {
  async create(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const bodySchema = z.object({
      userId: z.uuid(),
    })

    const { id: teamId } = paramsSchema.parse(request.params)
    const { userId } = bodySchema.parse(request.body)

    const team = await prisma.teams.findUnique({
      where: { id: teamId },
    })

    if (!team) {
      throw new AppError("Time não encontrado", 404)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    const teamMember = await prisma.teamsMembers.create({
      data: {
        teamId,
        userId,
      },
    })

    return response.status(201).json(teamMember)
  }

  async remove(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
      userId: z.uuid(),
    })

    const { id: teamId, userId } = paramsSchema.parse(request.params)

    const team = await prisma.teams.findUnique({
      where: { id: teamId },
    })

    if (!team) {
      throw new AppError("Time não encontrado", 404)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    const teamMember = await prisma.teamsMembers.deleteMany({
      where: {
        teamId,
        userId,
      },
    })

    if (teamMember.count === 0) {
      throw new AppError("Usuário não pertence a esse time", 404)
    }

    return response.status(204).json({ message: "Usuário Removido do time" })
  }

  async show(request: Request, response: Response) {
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

    const members = await prisma.teamsMembers.findMany({
      where: {
        teamId: id,
      },
      select: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return response.json(members)
  }
}

export { TeamMembersController }
