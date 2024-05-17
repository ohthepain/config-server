"use strict";
const request = require('supertest');
const app = require('../../app'); // Adjust the path to your Express app

describe('Project Routes', () => {
    let adminToken;

    beforeAll(async () => {
        // Authenticate as admin and obtain token
        const adminResponse = await request(app)
            .post('/api/auth')
            .send({
                email: 'admin@pete.com',
                password: 'password'
            });
        adminToken = adminResponse.body.accessToken; // Adjust according to actual response structure
    });

    test('Create a new project', async () => {
        const projectData = {
            name: 'New Project',
            gitRepo: 'http://github.com/example/repo.git',
            bucket: 'example-bucket'
        };

        const response = await request(app)
            .put('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(projectData);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
    });

    test('Create a new project - bad request', async () => {
        const projectData = {
            gitRepo: 'http://github.com/example/repo.git',
            bucket: 'example-bucket'
        };

        const response = await request(app)
            .put('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(projectData);

        expect(response.statusCode).toBe(400);
    });

    test('Delete a project - bad request', async () => {
        const response = await request(app)
            .delete('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(400);
    });

    test('Delete a project', async () => {
        const response = await request(app)
            .delete('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'New Project' });
        expect(response.statusCode).toBe(204);
    });

    test('Retrieve all projects', async () => {
        const response = await request(app)
            .get('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });
});

