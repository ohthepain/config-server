const bcrypt = require('bcrypt')

async function createUser(prisma, email, password, roles) {
  let user
  const result = await prisma.$transaction(async (prisma) => {
    user = await prisma.user.create({
      data: {
        email: email,
        password: bcrypt.hashSync(password, 8)
      },
    })

    // Associate roles
    await Promise.all(roles.map(async roleName => {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: roleName  // Assuming roleName is the ID in the Role model
        }
      });
    }));
  })

  return user
}

module.exports = { createUser }
