"use strict";
var express = require('express');
var router = express.Router();
const { verifyToken, isUser, isAdmin } = require('../middleware/authJwt')

router.put('/', [verifyToken, isUser], async function(req, res, next) {
  const { projectId, gitBranch } = req.body
  if (!projectId || !gitBranch) {
    return res.status(400).send('Branch: projectId and git branch are required');
  }

  try {
    const prisma = req.prisma
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).send('Project not found');
    }
    
    const branch = await prisma.branch.create({
      data: {
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
  const { gitBranch, projectId } = req.body
  if (!gitBranch || !projectId) {
    return res.status(400).send('Branch gitBranch and projectId are required');
  }

  try {
    const prisma = req.prisma
    await prisma.branch.delete({
      where: {
        gitBranch: gitBranch,
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
    const { id, gitBranch, projectId } = req.query;
    const prisma = req.prisma
    if (id) {
        if (gitBranch || projectId) {
            return res.status(400).send("either branch id OR branch gitBranch and projectId");  
        }
        const branch = await prisma.branch.findUnique({ where: { id: id }})
        return res.send(branch)
    }
    else if (projectId) {
        const branches = await prisma.branch.findMany({ where: { projectId: projectId }})
        return res.send(branches)
    }
    else if (gitBranch) {
        if (!projectId) {
            return res.status(400).send("Branch gitBranch requires projectId (think dev, main,ect)");  
        } else {
            const branch = await prisma.branch.findUnique({ where: { gitBranch: gitBranch, projectId: projectId }})
            if (branch) {
                return res.send(branch)
            } else {
                return res.status(404).send(`Could not find branch with gitBranch $<gitBranch> for projectId ${projectId}`)
            }
        }
    } else {
        const all = await req.prisma.branch.findMany()
        return res.send(all);
    }
});

module.exports = router;
