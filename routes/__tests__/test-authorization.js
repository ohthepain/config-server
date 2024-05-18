"use strict";
const request = require('supertest');
const app = require('../../app'); // Adjust the path according to your project structure

describe('Authentication and Authorization Tests', () => {
  const users = [
    { email: 'user@pete.com', role: 'user' },
    { email: 'moderator@pete.com', role: 'moderator' },
    { email: 'admin@pete.com', role: 'admin' },
    { email: 'superadmin@pete.com', role: 'superadmin' }
  ];

  users.forEach(user => {
    describe(`Tests for ${user.email}`, () => {
      let token;

      beforeAll(async () => {
        // Authenticate and store the token
        const response = await request(app)
          .post('/api/auth')
          .send({
            email: user.email,
            password: process.env.TEST_ADMIN_PASSWORD // Assuming the password is process.env.TEST_ADMIN_PASSWORD for all
          });

        token = response.body.accessToken; // Adjust according to the actual response structure
      });

      test('Access user endpoint', async () => {
        const res = await request(app)
          .get('/api/auth/test/user')
          .set('Authorization', 'Bearer ' + token)

        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Public Content.');
      });

      test('Access moderator endpoint', async () => {
        const res = await request(app)
          .get('/api/auth/test/mod')
          .set('Authorization', 'Bearer ' + token)

        // Expect different status based on user role
        const expectedStatus = user.role === 'moderator' || user.role === 'admin' || user.role === 'superadmin' ? 200 : 403;
        expect(res.statusCode).toEqual(expectedStatus);
        if (expectedStatus === 200) {
          expect(res.text).toContain('Moderator Content.');
        }
      });

      test('Access admin endpoint', async () => {
        const res = await request(app)
          .get('/api/auth/test/admin')
          .set('Authorization', 'Bearer ' + token)

        const expectedStatus = user.role === 'admin' || user.role === 'superadmin' ? 200 : 403;
        expect(res.statusCode).toEqual(expectedStatus);
        if (expectedStatus === 200) {
          expect(res.text).toContain('Admin Content.');
        }
      });

      test('Access superadmin endpoint', async () => {
        const res = await request(app)
          .get('/api/auth/test/superadmin')
          .set('Authorization', 'Bearer ' + token)

        const expectedStatus = user.role === 'superadmin' ? 200 : 403;
        expect(res.statusCode).toEqual(expectedStatus);
        if (expectedStatus === 200) {
          expect(res.text).toContain('Superadmin Content.');
        }
      });
    });
  });
});
