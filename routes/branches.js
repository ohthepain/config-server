"use strict";
var express = require('express');
var router = express.Router();
const { verifyToken, isUser, isAdmin } = require('../middleware/authJwt')

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

router.delete('/', [verifyToken, isAdmin], async function(req, res, next) {
  const { name, projectId } = req.body
  if (!name || !projectId) {
    return res.status(400).send('Branch name and projectId are required');
  }

  try {
    const prisma = req.prisma
    await prisma.branch.delete({
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
    const { id, name, projectId } = req.query;
    const prisma = req.prisma
    if (id) {
        if (name || projectId) {
            return res.status(400).send("either branch id OR branch name and projectId");  
        }
        const branch = await prisma.branch.findUnique({ where: { id: id }})
        return res.send(branch)
    }
    else if (name) {
        if (!projectId) {
            return res.status(400).send("Branch name requires projectId (think dev, main,ect)");  
        } else {
            const branch = await prisma.branch.findUnique({ where: { name: name, projectId: projectId }})
            if (branch) {
                return res.send(branch)
            } else {
                return res.status(404).send(`Could not find branch with name $<name> for projectId ${projectId}`)
            }
        }
    } else {
        const all = await req.prisma.branch.findMany()
        return res.send(all);
    }
});

module.exports = router;
