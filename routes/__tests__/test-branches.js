const request = require('supertest');
const app = require('../../app'); // Adjust the path to your Express app

describe('Branch Routes', () => {
    let adminToken;
    let projectId;

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
                name: 'Test Project for Branches',
                gitRepo: 'http://github.com/example/repo.git',
                bucket: 'example-bucket'
            });
        projectId = projectResponse.body.id; // Adjust according to actual response structure
    });

    test('Create a new branch for cascade deletion', async () => {
        const branchData = {
            name: 'Cascade Branch',
            projectName: 'Test Project for Branches',
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
            name: 'New Branch',
            projectName: 'Test Project for Branches',
            gitBranch: 'main'
        };

        const response = await request(app)
            .put('/api/branches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(branchData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id');
    });

    test('Delete a branch', async () => {
        const response = await request(app)
            .delete('/api/branches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'New Branch', projectId });

        expect(response.statusCode).toBe(204);
    });

    afterAll(async () => {
        // Clean up: Delete the project
        await request(app)
            .delete('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Test Project for Branches' });
    });
});

