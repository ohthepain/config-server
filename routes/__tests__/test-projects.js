"use strict";
const request = require("supertest");
const app = require("../../app"); // Adjust the path to your Express app

describe("Project Routes", () => {
  const projectName = "Project for test-projects";
  let adminToken;
  let projectId;

  beforeAll(async () => {
    // Authenticate as admin and obtain token
    const adminResponse = await request(app).post("/api/auth").send({
      email: "admin@pete.com",
      password: process.env.TEST_ADMIN_PASSWORD,
    });
    adminToken = adminResponse.body.accessToken; // Adjust according to actual response structure

    // Delete project with projectName if it exists, ignore errors
    try {   
      await request(app)
        .delete(`/api/projects?name=${projectName}&ignoreErrors=true`) 
        .set("Authorization", `Bearer ${adminToken}`)
        .send();
    } catch (error) {
      // Ignore errors
    }
  });

  test("Create a new project", async () => {
    const projectData = {
      name: projectName,
      gitRepo: "http://github.com/example/repo.git",
    };
    let response = await request(app)
      .put("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(projectData);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    projectId = response.body.id;

    response = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();

    response = await request(app)
      .delete(`/api/projects?id=${projectId}`) 
      .set("Authorization", `Bearer ${adminToken}`)
      .send();
    expect(response.statusCode).toBe(204);
  });

  test("Create a new project - bad request", async () => {
    const projectData = {
      gitRepo: "http://github.com/example/repo.git",
      bucket: "example-bucket",
    };
    const response = await request(app)
      .put(`/api/projects?name=${projectName}&id=${projectId}`) 
      .set("Authorization", `Bearer ${adminToken}`)
      .send(projectData);

    expect(response.statusCode).toBe(400);
  });

  test("Create a new project - bad request", async () => {
    const projectData = {
      gitRepo: "http://github.com/example/repo.git",
      bucket: "example-bucket",
    };
    const response = await request(app)
      .put("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(projectData);

    expect(response.statusCode).toBe(400);
  });

  test("Delete a project - bad request", async () => {
    const response = await request(app)
      .delete("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(response.statusCode).toBe(400);
  });
});
