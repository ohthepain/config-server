const { PrismaClient } = require('@prisma/client')

async function dropAllTables() {
  var prisma
  try {
    prisma = new PrismaClient();
    console.log('Dropping all tables...');
    await prisma.$executeRaw`DROP SCHEMA public CASCADE;`;
    await prisma.$executeRaw`CREATE SCHEMA public;`;
    console.log('All tables dropped and schema reset.');
  } catch (error) {
    console.error('Error dropping tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

dropAllTables();

