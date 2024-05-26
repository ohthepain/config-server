"use strict"
const request = require('supertest');
const app = require('../../app'); // Adjust the path to your Express app
const { config } = require('dotenv');

describe('Index Tests', () => {
    let adminToken;
    let projectId;
    let branchId;
    let environmentId;
    const projectName = 'Index Test Project';
    const branchName = 'Index Test Branch';
    const environmentName = 'Index Test Environment';
    const gitHash = 'abc123';

    beforeAll(async () => {
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
                gitRepo: 'http://github.com/example/repo.git',
                bucket: 'example-bucket'
            });
        projectId = projectResponse.body.id;

        // Create a branch
        const branchResponse = await request(app)
            .put('/api/branches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: branchName,
                projectName: projectName,
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
        const configResponse = await request(app)
            .post('/api/configs')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                projectName: projectName,
                branchName: branchName,
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
        expect(deployResponse.statusCode).toBe(200);
    });

    afterAll(async () => {
        // Clean up: Delete the project
        await request(app)
            .delete('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: projectName });
    });
    
    test('Get home page?', async () => {
        var response = await request(app)
            .get('/')
        expect(response.statusCode).toBe(200);
    });

    test('Get config info', async () => {
        const url = `/environment-id?projectName=${encodeURIComponent(projectName)}&environmentName=${encodeURIComponent(environmentName)}`;
        const environmentIdResponse = await request(app)
            .get(url)
            .send();
        const environmentId = environmentIdResponse.body.id;

        const response = await request(app)
            .get(`/config-info?environmentId=${environmentId}`)
            .send();
        expect(response.statusCode).toBe(200);
    });
})
