"use strict"
const { PrismaClient } = require('@prisma/client');
let prisma

const { createUser } = require('../../services/user.js')

async function createRoles() {
  const roles = ['user', 'moderator', 'admin', 'superadmin'];
  
  for (const roleName of roles) {
      const roleExists = await prisma.role.findUnique({
          where: {
              name: roleName,
          },
      });

      if (!roleExists) {
          await prisma.role.create({
              data: {
                  name: roleName,
              },
          });
          console.log(`Role created: ${roleName}`);
      }
  }
}

async function createTestUsers() {
  const usersData = [
    { email: 'user@pete.com', roles: ['user'] },
    { email: 'moderator@pete.com', roles: ['moderator', 'user'] },
    { email: 'admin@pete.com', roles: ['admin', 'moderator', 'user'] },
    { email: 'superadmin@pete.com', roles: ['superadmin', 'moderator', 'admin', 'user'] }
  ];

  await Promise.all(usersData.map(async (userData) => {
    const user = await prisma.user.findUnique({ where: { email: userData.email } })
    if (!user) {
      await createUser(prisma, userData.email, process.env.TEST_ADMIN_PASSWORD, userData.roles);
    }
  }));

  console.log('Test users created');
}

module.exports = async () => {
  prisma = new PrismaClient()
  await createRoles()
  await createTestUsers()
  prisma.$disconnect()
}
