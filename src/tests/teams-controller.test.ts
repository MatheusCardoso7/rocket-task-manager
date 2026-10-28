
import request from "supertest"
import { prisma } from "@/database/prisma"
import { app } from "@/app"
import { hash } from "bcrypt"

const admin_ids: string[] = []

async function createAdmin() {
  const admin = await prisma.user.create({
    data: {
      name: "Admin Teams Test",
      email: `admin-teams-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`,
      password: await hash("password123", 10),
      role: "admin",
    },
  })

  admin_ids.push(admin.id)

  const sessionResponse = await request(app)
    .post("/sessions")
    .send({
      email: admin.email,
      password: "password123",
    })

  expect(sessionResponse.status).toBe(200)

  return {
    admin,
    token: sessionResponse.body.token,
  }
}

describe("TeamsController", () => {
  const team_ids: string[] = []

  afterAll(async () => {
    if (team_ids.length > 0) {
      await prisma.teamsMembers.deleteMany({
        where: {
          teamId: { in: team_ids },
        },
      })

      await prisma.teams.deleteMany({
        where: {
          id: { in: team_ids },
        },
      })
    }

    if (admin_ids.length > 0) {
      await prisma.user.deleteMany({
        where: {
          id: { in: admin_ids },
        },
      })
    }
  })

  it("should create a team", async () => {
    const { token } = await createAdmin()

    const teamResponse = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Team",
        description: "A team to test the controller",
      })

    team_ids.push(teamResponse.body.id)

    expect(teamResponse.status).toBe(201)
    expect(teamResponse.body.name).toEqual("Test Team")
  })

  it("should list the teams", async () => {
    const { token } = await createAdmin()

    const listResponse = await request(app)
      .get("/teams")
      .set("Authorization", `Bearer ${token}`)

    expect(listResponse.status).toBe(200)
  })
})
