"use strict";
const request = require('supertest');
const app = require('../../app'); // Adjust the path to your Express app

describe('Project Routes', () => {
    let adminToken;

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
});


