var express = require('express');
var router = express.Router();
const { signIn } = require('../controllers/auth')

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

router.delete('/:id', async function(req, res, next) {
  const { name } = req.params;
  if (!id) {
    return res.status(400).send('Role id is required');
  }

  try {
    const prisma = req.prisma
    project = await prisma.role.delete({
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

router.get('/', async function(req, res, next) {
  try {
    prisma = res.prisma
    const all = await req.prisma.branch.findMany()
    console.log(all);
    res.send(all);
  } catch (error) {
    console.log(error)
    next(error)
  }
});

router.get('/:name', async function(req, res, next) {
  const { name } = req.params;

  try {
    prisma = res.prisma
    const role = await prisma.role.findUnique({ where: { name: name } });
    res.send(role)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

module.exports = router;

