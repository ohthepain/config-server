var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const { verifyToken, isModerator, isAdmin, isUser, isModeratorOrAdmin } = require('../middleware/authJwt')
const { checkDuplicateEmail, checkRolesExist } = require('../middleware/verifySignup')

router.post('/register', [checkDuplicateEmail, checkRolesExist], async function(req, res, next) {
  const { email, password, roles } = req.body
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const prisma = req.prisma
    const result = await prisma.$transaction(async (prisma) => {
      let user = await prisma.user.create({
        data: {
          email: email,
          password: bcrypt.hashSync(password, 8)
        },
      })

      // Associate roles
      await Promise.all(roles.map(roleName => {
        return prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: roleName  // Assuming roleName is the ID in the Role model
          }
        });
      }));

      return user
    })

    res.status(201).send({ message: "User created successfully", id: result.id });
  } catch (error) {
    console.log(error)
    next(error)
  }
});

router.get('/:email', [verifyToken, isUser], async function(req, res, next) {
  const { email } = req.params
  if (!email) {
    return res.status(404).send('Email required');
  }

  try {
    const prisma = req.prisma
    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      return res.status(404).send('Email not found');
    }
    res.send(user);
  } catch (error) {
    console.log(error)
    next(error)
  }
});

router.get('/', [verifyToken, isUser], async function(req, res, next) {
  const { email, id } = req.body
  if (email && id) {
    return res.status(404).send('Email or id can be specified, but not both');
  }

  try {
    const prisma = req.prisma

    if (!email && !id) {
      const all = await req.prisma.branch.findMany()
      res.send(all)
    }
    else if (id) {
      const user = await prisma.user.findUnique({ where: { id: id } });
      if (!exists) {
        return res.status(404).send('id not found');
      }
      res.send(user)
    }
    else if (email) {
      const user = await prisma.user.findUnique({ where: { email: email } });
      if (!exists) {
        return res.status(404).send('Email not found');
      }
      res.send(user)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }

  res.send(project);
});

router.delete('/:email', [verifyToken, isModeratorOrAdmin], async function(req, res, next) {
  const { email } = req.params;
  if (!email) {
    return res.status(400).send('email is required');
  }

  try {
    const prisma = req.prisma;
    await prisma.user.delete({
      where: {
        email: email,
      },
    });
    res.status(204).send({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(404).send({ message: 'User not found' });
    // next(error);
  }
});

module.exports = router;
