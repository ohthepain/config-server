"use strict";
const request = require('supertest');
const app = require('../../app');
const e = require('express');

describe('Environment Routes', () => {
    let adminToken;
    const projectName = 'Test Project for Environments';
    const environmentName = 'Test Environment';
    let projectId;
    let environmentId;

    beforeAll(async () => {
        // Authenticate and get admin token
        const adminRes = await request(app)
            .post('/api/auth')
            .send({ email: 'admin@pete.com', password: process.env.TEST_ADMIN_PASSWORD });
        adminToken = adminRes.body.accessToken;

        try {
            await request(app)
                .delete('/api/projects')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: projectName });
        } catch (err) {
            // Ignore errors
        }

        // Create a project to associate with environments
        const projectRes = await request(app)
            .put('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: projectName, gitRepo: 'http://github.com/example/repo.git', bucket: 'example-bucket' });
        projectId = projectRes.body.id;
    });

    afterAll(async () => {
        // Clean up: Delete the project
        await request(app)
            .delete('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: projectName });
    });

    test('Create and retrieve a new environment', async () => {
        const environmentData = {
            name: environmentName,
            projectId: projectId
        };

        var response = await request(app)
            .put('/api/environments')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(environmentData);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id');

        // Retrieve the environment
        response = await request(app)
            .get(`/api/environments?name=${environmentName}&projectId=${projectId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(environmentName);
        environmentId = response.body.id;

        // Retrieve the environment with wrong name in query
        response = await request(app)
            .get(`/api/environments?environmentId=${environmentId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(400);

        // Retrieve the environment by ID
        response = await request(app)
            .get(`/api/environments?id=${environmentId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(200);

        // Retrieve the environment by ID and project ID
        response = await request(app)
            .get(`/api/environments?id=${environmentId}&projectId=${projectId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(400);

        // Retrieve an unknown environment
        response = await request(app)
            .get(`/api/environments?name=xxx&projectId=${projectId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(404);

        // Update the environment
        const updateData = {
            name: environmentName,
            projectId: projectId
        };
        response = await request(app)
            .put('/api/environments')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updateData);
        expect(response.statusCode).toBe(200);

        // Delete the environment
        response = await request(app)
            .delete('/api/environments')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: environmentName, projectId: projectId });
        expect(response.statusCode).toBe(204);
    });

    test('Update an environment with no projectId', async () => {
        const updateData = {
            name: environmentName,
        };
        const response = await request(app)
            .put('/api/environments')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updateData);
        expect(response.statusCode).toBe(400);
    });

    test('Update an environment for a project that does not exist', async () => {
        const updateData = {
            name: environmentName,
            projectId: 'non-existent-project'
        };
        const response = await request(app)
            .put('/api/environments')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updateData);
        expect(response.statusCode).toBe(404);
    });

    test('Retrieve all environments', async () => {
        const response = await request(app)
            .get('/api/environments')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    test('Delete an environment with no projectId', async () => {
        const updateData = {
            name: environmentName,
        };
        const response = await request(app)
            .delete('/api/environments')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updateData);
        expect(response.statusCode).toBe(400);
    });

    test('Retrieve an environment with no projectId', async () => {
        const response = await request(app)
            .get(`/api/environments?name=${environmentName}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(400);
    });
});
