var express = require('express');
var router = express.Router();
const { verifyToken, isUser } = require('../middleware/authJwt')

router.get('/', [verifyToken, isUser], async function(req, res, next) {
  try {
    const prisma = req.prisma
    const configs = await prisma.config.findMany({})
    res.status(200).send(configs);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to retrieve configurations');
  }
})

router.get('/:branchName', [verifyToken, isUser], async function(req, res, next) {
  const branchName = req.query.branchName;
  if (!branchName) {
      return res.status(400).send('Branch name is required');
  }

  try {
      const prisma = req.prisma;
      const branch = await prisma.branch.findUnique({
          where: { name: branchName },
          include: {
              configs: true
          }
      });

      if (!branch) {
          return res.status(404).send('Branch not found');
      }

      res.status(200).send(branch.configs);
  } catch (error) {
      console.error(error);
      res.status(500).send('Failed to retrieve configurations');
  }
});

// New config
router.post('/', [verifyToken, isUser], async function(req, res, next) {
    const { projectName, branchName, gitHash } = req.body;

    if (!projectName || !branchName) {
        return res.status(400).send('All of projectId, branchId and gitHash are required');
    }

    try {
      const prisma = req.prisma;
      const project = await prisma.project.findUnique({ where: { name: projectName } });
      if (!project) {
        return res.status(404).send('Project not found');
      }
  
      const branch = await prisma.branch.findUnique({ where: { name: branchName } });
      if (!branch) {
        return res.status(404).send('Branch not found');
      }
  
      const newConfig = await req.prisma.config.create({
          data: {
              status: "CREATED",
              projectId: project.id,
              branchId: branch.id,
              gitHash: gitHash,
              userId: req.userId,
          }
      });
      res.status(201).send(newConfig);
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to create configuration');
    }
});

// Update status
router.put('/update-status', [verifyToken, isUser], async function(req, res, next) {
  const { configId, status } = req.body;

  if (!status || !configId) {
      return res.status(400).send('Status and configId are required');
  }

  if (status != "WAITING" && status != "BUILDING") {
    return res.status(400).send('Status can only be WAITING or BUILDING. DONE');
  }

  try {
      const prisma = req.prisma;
      const updatedConfig = await prisma.config.update({
          where: { id: configId },
          data: { status: status }
      });
      res.status(200).send(updatedConfig);
  } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Failed to update config status' });
  }
});

// Update downloadUrl, checksumMd5, set status to DONE
router.post('/complete', [verifyToken, isUser], async function(req, res) {
  const { id, downloadUrl, checksumMd5 } = req.body;

  if (!id || !downloadUrl || !checksumMd5) {
      return res.status(400).send('All fields (id, downloadUrl, checksumMd5) are required');
  }

  try {
      const updatedConfig = await req.prisma.config.update({
          where: { id: parseInt(id) },
          data: {
              downloadUrl: downloadUrl,
              checksumMd5: checksumMd5,
              status: "DONE",
          }
      });

      res.status(200).send(updatedConfig);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error updating config');
  }
});

router.delete('/:id', [verifyToken, isUser], async function(req, res, next) {
  const { id } = req.params;
  if (!id) {
      return res.status(400).send('Config ID is required');
  }

  try {
      const prisma = req.prisma;
      await prisma.config.delete({
          where: {
              id: id,
          },
      });
      res.status(204).send();
  } catch (error) {
      console.error(error);
      res.status(500).send('Failed to delete configuration');
  }
});

module.exports = router;
