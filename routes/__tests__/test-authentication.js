"use strict";
const request = require('supertest');
const app = require('../../app'); // Adjust the path to your Express app

describe('Project Routes', () => {
    let adminToken;
    const projectName = 'Test Authentication Project'

    beforeAll(async () => {
        const adminRes = await request(app)
            .post('/api/auth')
            .send({ email: 'admin@pete.com', password: process.env.TEST_ADMIN_PASSWORD });
        adminToken = adminRes.body.accessToken;

        // Delete project if it's left over from a previously failed test
        await request(app)
            .delete(`/api/projects?name=${projectName}&ignoreErrors=true`) 
            .set('Authorization', `Bearer ${adminToken}`)
            .send();
    })

    test('Test authentication', async () => {
        var response = await request(app)
            .post('/api/auth')
            .send({ email: 'admin@pete.com', password: process.env.TEST_ADMIN_PASSWORD });
        expect(response.statusCode).toBe(200);

        // Bad password
        var response = await request(app)
            .post('/api/auth')
            .send({ email: 'admin@pete.com', password: "wrong password" });
        expect(response.statusCode).toBe(401);

        // Unknown account
        var response = await request(app)
            .post('/api/auth')
            .send({ email: 'nobodyIknow@idkpeteeither.com', password: "wrong password" });
        expect(response.statusCode).toBe(401);

        // Bad request
        response = await request(app)
            .post('/api/auth')
            .send({ email: 'admin@pete.com' });
        expect(response.statusCode).toBe(400);
    });
    
    test('Create a new project', async () => {
        const projectData = {
            name: projectName,
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

    afterAll(async () => {
        await request(app)
            .delete(`/api/projects?name=${projectName}&ignoreErrors=true`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send();
    })
});
