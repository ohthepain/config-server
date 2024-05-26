"use strict";
var express = require('express');
var router = express.Router();
const { verifyToken, isUser } = require('../middleware/authJwt');
const { Prisma } = require('@prisma/client');

router.get('/', [verifyToken, isUser], async function(req, res, next) {
    const { id, branchId, projectId } = req.query;
    try {
        const prisma = req.prisma;
        if (id) {
            if (branchId || projectId) {
                return res.status(400).send("If you specify id you cannot specify branchId or projectId")
            }
            const config = await prisma.config.findUnique({
                where: { id: parseInt(id) }
            });
            if (config) {
                return res.status(200).send(config);
            } else {
                return res.status(404).send('Config not found');
            }
        } else if (branchId) {
            const configs = await prisma.config.findMany({
                where: { branchId: branchId }
            });
            if (configs && configs.length > 0) {
                return res.status(200).send(configs);
            } else {
                return res.status(404).send(`No configs found for branchId <${branchId}>`);
            }
        } else if (projectId) {
            const configs = await prisma.config.findMany({
                where: { projectId: projectId }
            });
            if (configs && configs.length > 0) {
                return res.status(200).send(configs);
            } else {
                return res.status(404).send(`No configs found for projectId <${projectId}>`);
            }
        } else {
            return res.status(200).send(await prisma.config.findMany());
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to find config');
    }
})

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
              userId: req.userId || "api token",
          }
      });

      if (req.decodedToken && req.decodedToken.exp) {
        const now = new Date();
        const issuedAt = new Date(req.decodedToken.iat * 1000);
        const expiresAt = new Date(req.decodedToken.exp * 1000);
        const age = now - issuedAt;
        const oneMonth = 30 * 24 * 60 * 60 * 1000;
        const timeUntilExpiration = expiresAt - now;
        if (age > oneMonth && timeUntilExpiration < oneMonth) {
            newConfig.message = `Your API token expires ${new Date(req.decodedToken.exp * 1000)}! Please generate a new one.`
        }
      }

      res.status(201).send(newConfig);
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to create configuration: ' + error.message);
    }
});

// Update status
router.put('/update-status', [verifyToken, isUser], async function(req, res, next) {
  const { id, status } = req.body;

  if (!status || !id) {
      return res.status(400).send('Status and config id are required');
  }

  if (status != "WAITING" && status != "BUILDING") {
    return res.status(400).send('Status can only be WAITING or BUILDING.');
  }

  try {
      const prisma = req.prisma;
      const updatedConfig = await prisma.config.update({
          where: { id: id },
          data: { status: status }
      });
      res.status(200).send(updatedConfig);
  } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Failed to update config status' });
  }
});

// Update downloadUrl, checksumMd5, set status to DONE
router.put('/complete', [verifyToken, isUser], async function(req, res) {
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
              id: parseInt(id),
          },
      });
      res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // P2025 is the code for "Record to delete does not exist."
      res.status(404).send('Config not found');
    } else {
        console.error(error);
        res.status(500).send('Failed to delete configuration');
    }
  }
});

module.exports = router;
