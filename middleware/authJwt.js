const jwt = require("jsonwebtoken");

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
    next();
  });
};

function isUser(req, res, next) {
  if (req.userId != null) {
    next();  // Proceed to the next middleware or route handler
  } else {
    res.status(403).send({message: "User not authenticated"});  // Send an error response
  }
};

async function isAdmin(req, res, next) {
  const prisma = req.prisma
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      roles: true
    }
  });

  for (const role of user.roles) {
    if (role.roleId === "admin") {
      next(); // Proceed to the next middleware if user is a moderator
      return;
    }
  }
  
  res.status(403).send({
    message: "Require Moderator Role!"
  });
};

isModerator = async (req, res, next) => {
  const prisma = req.prisma
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      roles: true
    }
  });

  for (const role of user.roles) {
    if (role.roleId === "moderator") {
      next(); // Proceed to the next middleware if user is a moderator
      return;
    }
  }
  
  res.status(403).send({
    message: "Require Moderator Role!"
  });
};

isModeratorOrAdmin = async (req, res, next) => {
  const prisma = req.prisma
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      roles: true
    }
  });


  for (const role of user.roles) {
    if (role.roleId === "moderator" || role.roleId === "admin") {
      next(); // Proceed to the next middleware if user is a moderator
      return;
    }
  }
  
  res.status(403).send({
    message: "Require Moderator Role!"
  });
};

isSuperAdmin = async (req, res, next) => {
  const prisma = req.prisma
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      roles: true
    }
  });


  for (const role of user.roles) {
    if (role.roleId === "superadmin") {
      next(); // Proceed to the next middleware if user is a moderator
      return;
    }
  }
  
  res.status(403).send({
    message: "Require Moderator Role!"
  });
};

module.exports = { verifyToken, isUser, isAdmin, isModerator, isModeratorOrAdmin, isSuperAdmin }
