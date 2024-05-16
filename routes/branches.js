var express = require('express');
var router = express.Router();
const { verifyToken, isUser } = require('../middleware/authJwt')

router.put('/', [verifyToken, isUser], async function(req, res, next) {
  const { name, projectName, gitBranch } = req.body
  if (!name || !projectName || !gitBranch) {
    return res.status(400).send('Branch: name, projectId and git branch are required');
  }

  try {
    const prisma = req.prisma
    const project = await prisma.project.findUnique({ where: { name: projectName } });
    if (!project) {
      return res.status(404).send('Project not found');
    }
    
    const branch = await prisma.branch.create({
      data: {
        name: name,
        projectId: project.id,
        gitBranch: gitBranch,
      },
    })

    res.send(branch)
  } catch (error) {
    console.log(error)
    next(error)
  }
});

router.delete('/', [verifyToken, isUser], async function(req, res, next) {
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
    res.status(204).send([]);
  } catch (error) {
    console.log(error)
    next(error)
  }
});

router.get('/', [verifyToken, isUser], async function(req, res, next) {
  prisma = res.prisma
  const all = await req.prisma.branch.findMany()
  console.log(all);
  res.send(all);
});

module.exports = router;
