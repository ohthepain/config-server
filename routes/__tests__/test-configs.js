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
        await request(app)
        .delete('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: projectName, gitRepo: 'http://github.com/example/repo.git', bucket: 'example-bucket' });

        // Create project
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

        // Create branches
        await request(app)
            .put('/api/branches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Branch for test-configs', projectName: projectName, gitBranch: 'main' });
        await request(app)
            .put('/api/branches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Cascade branch for test-config', projectName: projectName, gitBranch: 'main' });
    });

    test('Create and cascade delete configs', async () => {
        // Create config
        const configRes = await request(app)
            .post('/api/configs')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ projectName: projectName, branchName: 'Branch for test-configs', gitHash: 'abc123', userId: adminUserId });
        expect(configRes.statusCode).toBe(201);

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
