const request = require("supertest");
const app = require("../server");

describe("Test Endpoints", () => {
  it("GET /refactoreMe1", () => {
    request(app).get("/api/data").expect(200);
  });

  it("POST /refactoreMe2", async () => {
    const response = await request(app).post("/api/data").send({
      userId: 1,
      values: "{100,100,100,100,100}",
    });
    expect(response.status).toBe(201);
  });

  it("GET /getData", () => {
    request(app).get("/api/attacks").expect(200);
  });
});
