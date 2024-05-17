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
            .send({ email: 'admin@pete.com', password: 'password' });
        adminToken = adminRes.body.accessToken;
        adminUserId = adminRes.body.id;

        // Delete project if it's left over from a previously failed test
        // Can't do this with api tokens
        await request(app)
        .delete('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: projectName, gitRepo: 'http://github.com/example/repo.git', bucket: 'example-bucket' });

        // Create project using admin token
        try {
            projectRes = await request(app)
                .put('/api/projects')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: projectName, gitRepo: 'http://github.com/example/repo.git', bucket: 'example-bucket' });
            projectId = projectRes.body.id;
        } catch (error) {
            console.error(error)
            return
        }

        // Create branches (cannot use api token)
        try {
            await request(app)
                .put('/api/branches')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Branch for api-test', projectName: projectName, gitBranch: 'main' });
        } catch (error) {
            console.error(error)
            return
        }
        try {
            await request(app)
                .put('/api/branches')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Cascade branch for api-test', projectName: projectName, gitBranch: 'main' });
        } catch (error) {
            console.error(error)
            return
        }
        // Request an API token using the authenticated session
        const tokenRes = await request(app)
            .get('/api/auth/api-token')
            .set('Authorization', `Bearer ${adminToken}`);
        apiToken = tokenRes.body.accessToken;
    });

    test('Create and cascade delete configs', async () => {
        // Create config
        const configRes = await request(app)
            .post('/api/configs')
            .set('Authorization', `Bearer ${apiToken}`)
            .send({ projectName: projectName, branchName: 'Branch for api-test', gitHash: 'abc123', userId: adminUserId });
        expect(configRes.statusCode).toBe(201);

        // Delete project and cascade (not api token)
        const delRes = await request(app)
            .delete('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: projectName });
        expect(delRes.statusCode).toBe(204);

        // Verify deletion
        const checkRes = await request(app)
            .get('/api/configs')
            .set('Authorization', `Bearer ${apiToken}`);
        expect(checkRes.body).toEqual(expect.not.arrayContaining([{ id: configRes.body.id }]));
    });

    afterAll(async () => {
        // Cleanup if needed
    });
}, Infinity);
