const request = require('supertest');
const app = require('../../app'); // Adjust the path to your Express app

describe('Admin User Tests', () => {
    let adminToken;
    const testUserEmail = "test@example.com"
  
    beforeAll(async () => {
        // Authenticate as admin
        const adminResponse = await request(app)
            .post('/api/auth')
            .send({
                email: 'admin@pete.com', // Admin email
                password: 'password'
            });
  
        adminToken = adminResponse.body.accessToken; // Adjust according to actual response structure
    });
    
    // Test user registration
    test('Register a new user', async () => {
        const userData = {
            email: testUserEmail,
            password: 'password123',
            roles: ['user']
        };

        const response = await request(app)
            .post('/api/users/register')
            .set('Content-Type', 'application/json')
            .send(userData);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        token = response.body.token; // Save the auth token for authenticated requests
    });

    // Test retrieving the registered user
    test('Get the registered user', async () => {
        const response = await request(app)
            .get(`/api/users/${testUserEmail}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.email).toBe(testUserEmail);
    });

    // Test deleting the registered user
    test('Delete the registered user', async () => {
        const response = await request(app)
            .delete(`/api/users/${testUserEmail}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(204);
    });

    test('Delete the registered user', async () => {
        const response = await request(app)
            .delete(`/api/users/unknownuser`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(404);
    });
});
