var express = require('express');
var router = express.Router();

router.put('/', async function(req, res, next) {
  const { name } = req.body
  if (!name) {
    return res.status(400).send('Role name is required');
  }

  try {
    const prisma = req.prisma

    const exists = await prisma.role.findUnique({ where: { name: name } });
    if (exists) {
      return res.status(404).send('Role already exists');
    }
    
    role = await prisma.role.create({
      data: {
        name: name,
      },
    })
  } catch (error) {
    console.log(error)
    next(error)
  }

  res.send(project);
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

