"use strict"
const jwt = require("jsonwebtoken");

const createApiToken = async (req, res) => {
    const token = jwt.sign({
            // Need a userid due to the config-user db relation
            id: req.userId,
            roles: ["ROLE_USER"],
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            algorithm: 'HS256',
            allowInsecureKeySizes: true,
            expiresIn: '1y',
        });

    res.status(200).send({
        accessToken: token
    });
};

// NOTE: Stores the user ID in the request object
function verifyToken(req, res, next) {
  let token = req.headers["authorization"];  
  if (!token || token.split(' ').length < 2) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }
  token = token.split(' ')[1];
  
  const secret = process.env.ACCESS_TOKEN_SECRET;
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    
    req.userId = decoded.id;
    req.decodedToken = decoded;
    next();
  });
};

function isUser(req, res, next) {
  if (req.decodedToken.roles.includes('ROLE_USER')) {
    next();
  } else {
    res.status(403).send({message: "User not authenticated"});
  }
};

async function isAdmin(req, res, next) {
  if (req.decodedToken.roles.includes('ROLE_ADMIN')) {
    next();
  } else {
    res.status(403).send({
      message: "Require Admin Role!"
    });
  }
};

const isModerator = async (req, res, next) => {
  if (req.decodedToken.roles.includes('ROLE_MODERATOR')) {
    next();
  } else {
    res.status(403).send({
      message: "Require Moderator Role!"
    });
  }
};

const isModeratorOrAdmin = async (req, res, next) => {
  if (req.decodedToken.roles.includes('ROLE_ADMIN') || req.decodedToken.roles.includes('ROLE_MODERATOR')) {
    next();
  } else {
    res.status(403).send({
      message: "Require Admin Role!"
    });
  }
};

const isSuperAdmin = async (req, res, next) => {
  if (req.decodedToken.roles.includes('ROLE_SUPERADMIN')) {
    next();
  } else {
    res.status(403).send({
      message: "Require Moderator Role!"
    });
  }
};

module.exports = { createApiToken, verifyToken, isUser, isAdmin, isModerator, isModeratorOrAdmin, isSuperAdmin }
