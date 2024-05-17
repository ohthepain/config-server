"use strict";
var express = require('express');
var router = express.Router();
const { signIn, createApiToken } = require('../controllers/auth')
const { verifyToken, isModerator, isAdmin, isUser, isModeratorOrAdmin } = require('../middleware/authJwt')

router.get("/test/user", [verifyToken], async function(req, res, next) {
  res.status(200).send("Public Content.");
});

router.get("/test/mod", [verifyToken, isModerator], async function(req, res, next) {
  res.status(200).send("Moderator Content.");
});

router.get("/test/admin", [verifyToken, isAdmin], async function(req, res, next) {
  res.status(200).send("Admin Content.");
});

router.get("/test/superadmin", [verifyToken, isSuperAdmin], async function(req, res, next) {
  res.status(200).send("Superadmin Content.");
});

router.post('/', async function(req, res, next) {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  try {
    await signIn(req, res)
  } catch (error) {
    console.log(error)
    next(error)
  }
});

router.get('/api-token', [verifyToken, isUser], async function(req, res, next) {
  try {
    await createApiToken(req, res)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

module.exports = router;

