const request = require('supertest');
const app = require('../index');

describe("Auth Tests", () => {
    test("Register User", async () => {
        const res = await request(app).post("/register").send({ username: "testUser", email: "test@example.com", password: "password123" });
        expect(res.statusCode).toBe(201);
    });

    test("Login User", async () => {
        const res = await request(app).post("/login").send({ email: "test@example.com", password: "password123" });
        expect(res.statusCode).toBe(200);
    });
});
