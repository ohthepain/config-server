var express = require('express');
var router = express.Router();

router.put('/', async function(req, res, next) {
  const { name, projectId } = req.body
  if (!name || !projectId) {
    return res.status(400).send('Branch name and projectId are required');
  }

  try {
    const prisma = req.prisma

    const projectExists = await prisma.project.findUnique({ where: { id: projectId } });
    if (!projectExists) {
      return res.status(404).send('Project not found');
    }
    
    project = await prisma.branch.create({
      data: {
        name: name,
        projectId: projectId,
        gitBranch: req.gitBranch || null,
      },
    })
  } catch (error) {
    console.log(error)
    next(error)
  }

  res.send(project);
});

router.delete('/', async function(req, res, next) {
  const { name, projectId } = req.body
  if (!name || !projectId) {
    return res.status(400).send('Branch name and projectId are required');
  }

  try {
    const prisma = req.prisma
    project = await prisma.branch.delete({
      where: {
        name: name,
        projectId: projectId
      },
    })
  } catch (error) {
    console.log(error)
    next(error)
  }

  res.send([]);
});

router.get('/', async function(req, res, next) {
  prisma = res.prisma
  const all = await req.prisma.branch.findMany()
  console.log(all);
  res.send(all);
});

module.exports = router;
