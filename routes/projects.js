var express = require('express');
var router = express.Router();

const { verifyToken, isAdmin, isUser } = require('../middleware/authJwt')

router.put('/', [verifyToken, isAdmin], async function(req, res, next) {
  const { name, gitRepo, bucket } = req.body
  if (!name) {
    return res.status(400).send('Project name is required');
  }

  try {
    const prisma = req.prisma
    project = await prisma.project.create({
      data: {
        name: name,
        gitRepo: gitRepo,
        bucket: bucket,
      },
    })
    res.status(201).send(project);
  } catch (error) {
    console.log(error)
    next(error)
  }
});

router.delete('/', [verifyToken, isAdmin], async function(req, res, next) {
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
    res.status(204).send([]);
  } catch (error) {
    console.log(error)
    next(error)
  }
});

router.get('/', [verifyToken, isUser], async function(req, res, next) {
  // res.render('index', { title: 'Projects' });
  const allProjects = await req.prisma.project.findMany()
  console.log(allProjects);
  res.send(allProjects);
});

module.exports = router;
