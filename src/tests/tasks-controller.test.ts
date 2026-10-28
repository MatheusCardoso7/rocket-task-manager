import request from "supertest"
import { prisma } from "@/database/prisma"
import { app } from "@/app"
import { hash } from "bcrypt"

describe("TasksController", () => {
  let admin_id: string | undefined
  let team_id: string | undefined
  let task_id: string | undefined

  afterAll(async () => {

    if (task_id) {
      await prisma.tasksHistory.deleteMany({
        where: { taskId: task_id },
      })


      await prisma.tasks.deleteMany({
        where: { id: task_id },
      })
    }

    if (team_id) {
      await prisma.teamsMembers.deleteMany({
        where: { teamId: team_id },
      })

      await prisma.teams.deleteMany({
        where: { id: team_id },
      })
    }

    if (admin_id) {
      await prisma.user.deleteMany({
        where: { id: admin_id },
      })
    }
  })

  it("should create a task", async () => {
    const admin = await prisma.user.create({
      data: {
        name: "Task Admin Test",
        email: `admin-tasks-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`,
        password: await hash("123456", 10),
        role: "admin",
      },
    })

    admin_id = admin.id

    const sessionResponse = await request(app).post("/sessions").send({
      email: admin.email,
      password: "123456",
    })

    expect(sessionResponse.status).toBe(200)

    const { token } = sessionResponse.body

    const teamResponse = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Team",
        description: "A team to test the controller",
      })

    team_id = teamResponse.body.id

    console.log("TEAM:", teamResponse.status, teamResponse.body)
    expect(teamResponse.status).toBe(201)

    const memberResponse = await request(app)
      .post(`/team-members/${team_id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        userId: admin.id,
      })

    expect(memberResponse.status).toBe(201)

    const taskResponse = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test task",
        description: "Task to test",
        assignedTo: admin.id,
        teamId: team_id,
      })

    task_id = taskResponse.body.id

    console.log("TASK:", taskResponse.status, taskResponse.body)
    expect(taskResponse.status).toBe(201)
  })
})
