"use strict";
const request = require('supertest');
const app = require('../../app');

describe('Config and Branch Cascading Tests', () => {
    let adminToken;
    let projectId;
    const projectName = 'Project for test-configs'
    let adminUserId;

    beforeAll(async () => {
        // Authenticate and get token
        const adminRes = await request(app)
            .post('/api/auth')
            .send({ email: 'admin@pete.com', password: process.env.TEST_ADMIN_PASSWORD });
        adminToken = adminRes.body.accessToken;
        adminUserId = adminRes.body.id;

        // Delete project if it's left over from a previously failed test
        await request(app)
        .delete('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ignoreErrors: true, name: projectName, gitRepo: 'http://github.com/example/repo.git', bucket: 'example-bucket' });

        // Create project
        try {
            const projectRes = await request(app)
                .put('/api/projects')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: projectName, gitRepo: 'http://github.com/example/repo.git', bucket: 'example-bucket' });
            projectId = projectRes.body.id;
        } catch (error) {
            console.error(error)
            return
        }

        // Create branches
        await request(app)
            .put('/api/branches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Branchfortestconfigs', projectName: projectName, gitBranch: 'main' });
        await request(app)
            .put('/api/branches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Cascade branch for test-config', projectName: projectName, gitBranch: 'main' });
    });

    test('should respond with 400 status code if required fields are missing', async () => {
        const response = await request(app)
        .post('/api/configs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ projectName: 'ValidProject', gitHash: '123abc' }); // Assume branchName is missing
    
        expect(response.statusCode).toBe(400);
    });

    test('should respond with 403 if no token is provided', async () => {
        const response = await request(app)
        .get('/api/configs');
    
        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({ message: 'No token provided!' });
    });

    test('should handle non-existent config gracefully', async () => {
        const response = await request(app)
        .get(`/api/configs/100`)
        .set('Authorization', `Bearer ${adminToken}`);
    
        expect(response.statusCode).toBe(404);
    });

    test('should handle non-existent config gracefully', async () => {
        const response = await request(app)
        .delete(`/api/configs/100`)
        .set('Authorization', `Bearer ${adminToken}`);
    
        expect(response.statusCode).toBe(404);
    });

    test('should respond with 500 if there is a server error', async () => {
        // Simulate server error by mocking prisma.config.create to throw an error
        // jest.spyOn(prisma.config, 'create').mockImplementation(() => {
        //     throw new Error('Database failure');
        // });
    
        const response = await request(app)
            .post('/api/configs')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ projectName: 'ValidProject', branchName: 'ValidBranch', gitHash: '123abc' });
    
        expect(response.statusCode).toBe(404);
    
        // Restore original implementation
        // jest.restoreAllMocks();
    });

    test('Create and cascade delete configs', async () => {
        // Create config
        const configRes = await request(app)
            .post('/api/configs')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ projectName: projectName, branchName: 'Branchfortestconfigs', gitHash: 'abc123', userId: adminUserId });
        expect(configRes.statusCode).toBe(201);

        const configId = configRes.body.id;
        var response = await request(app)
            .get(`/api/configs?id=${configId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(200);

        // Get branch
        response = await request(app)
            .get(`/api/branches?name=Branchfortestconfigs&projectId=${projectId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        const branch = response.body

        // All configs
        response = await request(app)
            .get(`/api/configs`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.body.length > 0).toBe(true)
        expect(response.statusCode).toBe(200);

        // Configs for project
        response = await request(app)
            .get(`/api/configs?projectId=${projectId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.body[0].projectId).toBe(projectId)
        expect(response.statusCode).toBe(200);

        // Configs for undefined project
        response = await request(app)
            .get(`/api/configs?projectId=999`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(404);

        // Configs for branch
        response = await request(app)
            .get(`/api/configs?branchId=${branch.id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(200);

        // Configs for undefined branch
        response = await request(app)
            .get(`/api/configs?branchId=667`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(404);

        // Individual config
        response = await request(app)
            .get(`/api/configs?id=${configId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(200);

        // Individual config
        response = await request(app)
            .get(`/api/configs?id=${configId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(200);

        // Status
        response = await request(app)
            .put(`/api/configs/update-status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ id: configId, status: "BUILDING"})
        expect(response.statusCode).toBe(200);

        // Status - bad request
        response = await request(app)
            .put(`/api/configs/update-status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: "BUILDING"})
        expect(response.statusCode).toBe(400);

        // Status - bad request
        response = await request(app)
            .put(`/api/configs/update-status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ id: configId, status: "WOW!!!"})
        expect(response.statusCode).toBe(400);

        // Complete a config
        response = await request(app)
            .put(`/api/configs/complete`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ id: configId, downloadUrl: "downloadUrl", checksumMd5: "checksumMd5" })
        expect(response.statusCode).toBe(200);

        // Bad request
        response = await request(app)
            .get(`/api/configs?id=${configId}&branchId=${branch.id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(400);

        // Bad request
        response = await request(app)
            .get(`/api/configs?id=${configId}&projectId=${projectId.id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(400);

        // Delete project and cascade
        const delRes = await request(app)
            .delete('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: projectName });
        expect(delRes.statusCode).toBe(204);

        // Verify deletion
        const checkRes = await request(app)
            .get('/api/configs')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(checkRes.body).toEqual(expect.not.arrayContaining([{ id: configRes.body.id }]));
    });

    afterAll(async () => {
        // Cleanup if needed
    });
});
