const request = require('supertest');
const app = require('../../app'); // Adjust the path to your Express app

describe('Admin User Tests', () => {
    const testUserEmail = "test@example.com"
    let adminToken;
    let user;
  
    beforeAll(async () => {
        // Authenticate as admin
        var adminResponse = await request(app)
            .post('/api/auth')
            .send({
                email: 'admin@pete.com', // Admin email
                password: process.env.TEST_ADMIN_PASSWORD
            });
        adminToken = adminResponse.body.accessToken;

        // Delete user if it's left over from a previous test
        var response = await request(app)
            .get(`/api/users`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ email: testUserEmail })
        if (response.statusCode == 200) {
            adminResponse = await request(app)
                .delete(`/api/users?email=${testUserEmail}`)
                .set('Authorization', `Bearer ${adminToken}`)
        }
    });
    
    // Test register, retrieve, delete user
    test('Register a new user', async () => {
        const userData = {
            email: testUserEmail,
            password: 'password123',
            roles: ['user']
        };

        var response = await request(app)
            .post('/api/users/register')
            .set('Content-Type', 'application/json')
            .send(userData);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');

        // Test bad request
        response = await request(app)
            .post('/api/users/register')
            .set('Content-Type', 'application/json')
            .send({
                email: testUserEmail
            });
        expect(response.statusCode).toBe(400);

        response = await request(app)
            .get(`/api/users`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ email: testUserEmail })
        expect(response.statusCode).toBe(200);
        expect(response.body.email).toBe(testUserEmail);
        user = response.body;

        response = await request(app)
            .get(`/api/users`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ id: user.id })
        expect(response.statusCode).toBe(200);
        expect(response.body.email).toBe(testUserEmail);
        
        response = await request(app)
            .get(`/api/users`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ email: testUserEmail })
        expect(response.statusCode).toBe(200);
        expect(response.body.email).toBe(testUserEmail);

        response = await request(app)
            .delete(`/api/users?email=${testUserEmail}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(204);
    });

    test('Get user - bad email', async () => {
        const response = await request(app)
            .get(`/api/users`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ email: "foo" })
        expect(response.statusCode).toBe(404);
    });

    test('Get all registered users', async () => {
        const response = await request(app)
            .get(`/api/users`)
            .set('Authorization', `Bearer ${adminToken}`)
        expect(response.statusCode).toBe(200);
        expect(response.body.length > 0).toBe(true);
    });

    test('Delete the registered user - unknown user', async () => {
        const response = await request(app)
            .delete(`/api/users?email=unknownuser`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(404);
    });

    test('Delete the registered user - unknown user', async () => {
        const response = await request(app)
            .delete(`/api/users?id=unknownuser`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(404);
    });

    test('Delete the registered user - bad query', async () => {
        const response = await request(app)
            .delete(`/api/users?id=unknownuser&email=wevz`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(400);
    });
});
