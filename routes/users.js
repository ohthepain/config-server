"use strict";
var express = require('express');
var router = express.Router();
const { verifyToken, isModerator, isAdmin, isUser, isModeratorOrAdmin } = require('../middleware/authJwt')
const { checkDuplicateEmail, checkRolesExist } = require('../middleware/verifySignup')

const { createUser } = require('../services/user.js')

router.post('/register', [checkDuplicateEmail, checkRolesExist], async function(req, res, next) {
  const prisma = req.prisma
  const { email, password, roles } = req.body

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const user = await createUser(prisma, email, password, roles)
    if (user) {
      return res.status(201).send(user);
    } else {
      return res.status(500).send({ message: "Some error occurred while creating the User." });
    } 
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

    // WTH is this?
    // if (prisma.user.findUnique({ where: { email: email }})) {
    //   return res.status(400).send("Email already registered")
    // }

    if (!email && !id) {
      const all = await req.prisma.user.findMany()
      return res.send(all)
    }
    else if (id) {
      const user = await prisma.user.findUnique({ where: { id: id } });
      if (!user) {
        return res.status(404).send('id not found');
      }
      return res.send(user)
    }
    else if (email) {
      const user = await prisma.user.findUnique({ where: { email: email } });
      if (!user) {
        return res.status(404).send('Email not found');
      }
      return res.send(user)
    }
  } catch (error) {
    console.log(error)
    return next(error)
  }
});

router.delete('/', [verifyToken, isModeratorOrAdmin], async function(req, res, next) {
  const { id, email } = req.query
  if (!id && !email) {
    return res.status(400).send('Required: user id or email')
  }
  if (id && email) {
    return res.status(400).send('id or email is required, not both');
  }

  try {
    const prisma = req.prisma;
    if (id) {
      await prisma.user.delete({
        where: {
          id: id,
        },
      });
    } else {
      await prisma.user.delete({
        where: {
          email: email,
        },
      });
    }
    res.status(204).send({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(404).send({ message: 'User not found' });
    // next(error);
  }
});

module.exports = router;
