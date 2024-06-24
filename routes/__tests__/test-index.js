"use strict";
const request = require('supertest');
const app = require('../../app');

describe('Index Routes', () => {
    let adminToken;
    let projectId;
    let branchId;
    let environmentId;
    const projectName = 'Index Test Project';
    const gitBranch = 'main';
    const environmentName = 'Index Test Environment';
    const gitHash = 'abc123';

    beforeAll(async () => {
        // Delete test project if it exists from last time
        await request(app)
            .delete(`/api/projects?name=${projectName}&ignoreErrors=true`)
            .send();

        // Authenticate and obtain token
        const adminResponse = await request(app)
            .post('/api/auth')
            .send({
                email: 'admin@pete.com',
                password: process.env.TEST_ADMIN_PASSWORD
            });
        adminToken = adminResponse.body.accessToken;

        // Create a project
        const projectResponse = await request(app)
            .put('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: projectName,
                gitRepo: 'https://github.com/example/repo.git',
                bucket: 'example-bucket'
            });
        projectId = projectResponse.body.id;

        // Create a branch
        const branchResponse = await request(app)
            .put('/api/branches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                projectId: projectId,
                gitBranch: 'main'
            });
        branchId = branchResponse.body.id;

        // Create an environment
        const environmentResponse = await request(app)
            .put('/api/environments')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: environmentName,
                projectId: projectId
            });
        environmentId = environmentResponse.body.id;

        // Create a config
        // const configRes2 = await request(app)
        //     .post('/api/configs')
        //     .set('Authorization', `Bearer ${adminToken}`)
        //     .send({ projectName: projectName, gitBranch: gitBranch, gitHash: gitHash, userId: adminResponse.body.id });
        // expect(configRes2.statusCode).toBe(201);

        // Create a config
        const configResponse = await request(app)
            .post('/api/configs')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                projectName: projectName,
                gitBranch: gitBranch,
                gitHash: gitHash,
                userId: adminResponse.body.id
            });
        const configId = configResponse.body.id

        // Deploy the config
        const deployResponse = await request(app)
            .put('/api/environments/deploy')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                environmentId: environmentId,
                configId: configId
            });
        if (deployResponse.statusCode !== 200) {
            console.log(deployResponse.body);
        }
        expect(deployResponse.statusCode).toBe(200);
    });

    test('Get home page?', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
    });

    afterAll(async () => {
        // Clean up: Delete the project
        await request(app)
            .delete(`/api/projects?name=${projectName}&ignoreErrors=true`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send();
    });
});

