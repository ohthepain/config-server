const request = require('supertest');
const app = require('../../app'); // Adjust the path to your Express app

describe('Index Tests', () => {
    test('Register a new user', async () => {
        var response = await request(app)
            .get('/')
        expect(response.statusCode).toBe(200);
    })
})
