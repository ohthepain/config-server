var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const { checkDuplicateEmail, checkRolesExist } = require('../middleware/verifySignup')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', [checkDuplicateEmail, checkRolesExist], async function(req, res, next) {
  const { email, password, roles } = req.body
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  if (roles) {
    console.log("We got roles: <%s>", roles)
  }

  try {
    const prisma = req.prisma
    let user = await prisma.user.create({
      data: {
        email: email,
        password: bcrypt.hashSync(password, 8)
      },
    })
  } catch (error) {
    console.log(error)
    next(error)
  }

  res.send("SUCCESS");
});

router.get('/', async function(req, res, next) {
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


router.delete('/', async function(req, res, next) {
  const { id } = req.body
  if (!id) {
    return res.status(400).send('id is required');
  }

  try {
    const prisma = req.prisma
    project = await prisma.user.delete({
      where: {
        id: id,
      },
    })
  } catch (error) {
    console.log(error)
    next(error)
  }

  res.send([]);
});

module.exports = router;
