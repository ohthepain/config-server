"use strict";
const request = require('supertest');
const app = require('../../app');

describe('Branch Routes', () => {
    let adminToken;
    let projectId;
    const gitBranch = "TestBranchfortestbranches"
    const cascadeGitBranch = 'Cascade Branch'
    const projectName = "TestProjectForBranches"

    beforeAll(async () => {
        // Authenticate and obtain token
        const adminResponse = await request(app)
            .post('/api/auth')
            .send({
                email: 'admin@pete.com',
                password: process.env.TEST_ADMIN_PASSWORD
            });
        adminToken = adminResponse.body.accessToken;

        // Create a project to test branches
        const projectResponse = await request(app)
            .put('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: projectName,
                gitRepo: 'http://github.com/example/repo.git',
                bucket: 'example-bucket'
            });
        projectId = projectResponse.body.id;
    });

    test('Create a new branches for normal and cascade deletion', async () => {
        // Get project by name
        let response = await request(app)
            .get(`/api/projects?name=${projectName}`)
            .set('Authorization', `Bearer ${adminToken}`);
        const project = response.body;

        let branchData = {
            gitBranch: cascadeGitBranch,
            projectId: project.id
        };

        response = await request(app)
            .put('/api/branches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(branchData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id');

        branchData = {
            gitBranch: gitBranch,
            projectId: project.id
        };

        response = await request(app)
            .put('/api/branches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(branchData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id');

        // Get branch by name
        response = await request(app)
            .get(`/api/branches?gitBranch=${gitBranch}&projectId=${projectId}`)
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
            .get(`/api/branches?id=${branch.id}&gitBranch=${gitBranch}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(400);

        response = await request(app)
            .delete('/api/branches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({});
        expect(response.statusCode).toBe(400);
    
        // Get all branches
        response = await request(app)
            .get(`/api/branches`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(200);

        // Delete a branch
        response = await request(app)
            .delete(`/api/branches?id=${branch.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send();
        expect(response.statusCode).toBe(204);
    });

    afterAll(async () => {
        // Clean up: Delete the project
        await request(app)
            .delete(`/api/projects?name=${projectName}`) 
            .set('Authorization', `Bearer ${adminToken}`)
            .send();
    });
});

