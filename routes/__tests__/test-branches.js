"use strict";
const request = require('supertest');
const app = require('../../app');

describe('Branch Routes', () => {
    let adminToken;
    let projectId;
    const branchName = "TestBranchfortestconfigs"

    beforeAll(async () => {
        // Authenticate and obtain token
        const adminResponse = await request(app)
            .post('/api/auth')
            .send({
                email: 'admin@pete.com',
                password: 'password'
            });
        adminToken = adminResponse.body.accessToken;

        // Create a project to test branches
        const projectResponse = await request(app)
            .put('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'TestProjectForBranches',
                gitRepo: 'http://github.com/example/repo.git',
                bucket: 'example-bucket'
            });
        projectId = projectResponse.body.id; // Adjust according to actual response structure
    });

    test('Create a new branch for cascade deletion', async () => {
        const branchData = {
            name: 'Cascade Branch',
            projectName: 'TestProjectForBranches',
            gitBranch: 'main'
        };

        const response = await request(app)
            .put('/api/branches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(branchData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id');
    });

    test('Create a new branch for api deletion', async () => {
        const branchData = {
            name: branchName,
            projectName: 'TestProjectForBranches',
            gitBranch: 'main'
        };

        var response = await request(app)
            .put('/api/branches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(branchData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id');

        // Get branch by name
        response = await request(app)
            .get(`/api/branches?name=${branchName}&projectId=${projectId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(200);
        const branch = response.body

        // Get branch by id
        response = await request(app)
            .get(`/api/branches?id=${branch.id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(200);

        // Get branch by id and name = BAD REQUEST
        response = await request(app)
            .get(`/api/branches?id=${branch.id}&name=${branchName}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(400);

        // Get all branches
        response = await request(app)
            .get(`/api/branches`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(200);
    });

    test('Delete a branch', async () => {
        const response = await request(app)
            .delete('/api/branches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: branchName, projectId: projectId });
        expect(response.statusCode).toBe(204);
    });

    afterAll(async () => {
        // Clean up: Delete the project
        await request(app)
            .delete('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'TestProjectForBranches' });
    });
});

