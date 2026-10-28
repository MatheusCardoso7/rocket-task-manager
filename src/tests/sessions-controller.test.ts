import request from "supertest"
import { prisma } from "@/database/prisma"
import { app } from "@/app"

describe("SessionsController", () => {
  let user_id: string | undefined

  afterAll(async () => {
    if (user_id) {
      await prisma.user.deleteMany({
        where: { id: user_id },
      })
    }
  })

  it("should authenticate and get access token", async () => {
    const email = `auth-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`

    const userResponse = await request(app).post("/users").send({
      name: "Auth Test User",
      email,
      password: "password123",
    })

    user_id = userResponse.body.id

    expect(userResponse.status).toBe(201)

    const sessionResponse = await request(app).post("/sessions").send({
      email,
      password: "password123",
    })

    expect(sessionResponse.status).toBe(200)
    expect(sessionResponse.body.token).toEqual(expect.any(String))
  })
})
