const jwt = require("jsonwebtoken");

function verifyAccessToken(token) {
  const secret = process.env.ACCESS_TOKEN_SECRET;

  try {
      const decoded = jwt.verify(token, secret);
      return { success: true, data: decoded };
  } catch (error) {
      return { success: false, error: error.message };
  }
}

// Function to verify the token from the request header
function verifyToken(req, res, next) {
  let token = req.headers["x-access-token"];  
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }
  
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    
    // Store the user ID in the request object
    req.userId = decoded.id;
    next();
  });
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

module.exports = { verifyToken, isAdmin, isModerator, isModeratorOrAdmin, isSuperAdmin }
