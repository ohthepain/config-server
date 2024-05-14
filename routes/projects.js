var express = require('express');
var router = express.Router();

router.put('/', async function(req, res, next) {
  const { name } = req.body
  if (!name) {
    return res.status(400).send('Project name is required');
  }

  try {
    const prisma = req.prisma
    project = await prisma.project.create({
      data: {
        name: name,
        gitRepo: res.gitRepo || null,
        bucket: res.bucket || null,
      },
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
  res.send(project);
});

router.delete('/', async function(req, res, next) {
  const { name } = req.body
  if (!name) {
    return res.status(400).send('Project name is required');
  }

  try {
    const prisma = req.prisma
    await prisma.project.delete({
      where: {
        name: name,
      },
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
  res.send([]);
});

router.get('/', async function(req, res, next) {
  // res.render('index', { title: 'Projects' });
  const allProjects = await req.prisma.project.findMany()
  console.log(allProjects);
  res.send(allProjects);
});

module.exports = router;
