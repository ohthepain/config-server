"use strict";

var express = require('express');
var router = express.Router();
const { verifyToken, isUser, isAdmin } = require('../middleware/authJwt');

// PUT route to create or update an environment
router.put('/', [verifyToken, isUser], async function (req, res, next) {
    const {
        name,
        projectId,
        configId,
        claimedByUserId,
        globalTimeTravel,
        notificationUrl,
        uploadLocation,
        downloadUrl,
        clientDownloadBucket,
        clientDownloadKey,
        awsAccessKey,
        awsSecretKey
    } = req.body;

    // Validate required fields
    if (!name || !projectId) {
        return res.status(400).send('Branch: name, projectId are required');
    }

    try {
        const prisma = req.prisma;

        // Check if the project exists
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            return res.status(404).send('Project not found');
        }

        // Check if the environment exists
        let environment = await prisma.environment.findUnique({ where: { name: name, projectId: project.id } });

        if (environment) {
            // Update existing environment
            environment = await prisma.environment.update({
                where: { id: environment.id },
                data: {
                    name: name || environment.name,
                    configId: configId || environment.configId,
                    claimedByUserId: claimedByUserId || environment.claimedByUserId,
                    globalTimeTravel: globalTimeTravel || environment.globalTimeTravel,
                    notificationUrl: notificationUrl || environment.notificationUrl,
                    uploadLocation: uploadLocation || environment.uploadLocation,
                    downloadUrl: downloadUrl || environment.downloadUrl,
                    clientDownloadBucket: clientDownloadBucket || environment.clientDownloadBucket,
                    clientDownloadKey: clientDownloadKey || environment.clientDownloadKey,
                    awsAccessKey: awsAccessKey || environment.awsAccessKey,
                    awsSecretKey: awsSecretKey || environment.awsSecretKey
                }
            });
        } else {
            // Create new environment
            environment = await prisma.environment.create({
                data: {
                    name: name,
                    projectId: projectId,
                    configId: null,
                    globalTimeTravel: 0,
                    notificationUrl: "",
                    uploadLocation: "",
                    downloadUrl: "",
                    clientDownloadBucket: "",
                    clientDownloadKey: "",
                    awsAccessKey: "",
                    awsSecretKey: ""
                }
            });
        }

        res.send(environment);
    } catch (error) {
        console.log(error);
        next(error);
    }
});


// PUT route to create or update an environment
router.put('/deploy', [verifyToken, isUser], async function (req, res, next) {
    const {
        environmentId,
        configId,
    } = req.body;

    // Validate required fields
    if (!environmentId || !configId) {
        return res.status(400).send('Environment id and config id are required');
    }

    try {
        const prisma = req.prisma;

        // Check if the environment exists
        let environment = await prisma.environment.findUnique({ where: { id: environmentId } });

        if (environment) {
            environment = await prisma.environment.update({
                where: { id: environmentId },
                data: {
                    configId: configId,
                }
            });
            return res.status(200).send('success');
        } else {
            return  res.status(404).send('Environment not found');
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

// DELETE route to delete an environment
router.delete('/', [verifyToken, isAdmin], async function (req, res, next) {
    const { name, projectId } = req.body;

    // Validate required fields
    if (!name || !projectId) {
        return res.status(400).send('Environment name and projectId are required');
    }

    try {
        const prisma = req.prisma;

        // Delete the environment
        await prisma.environment.delete({
            where: {
                name: name,
                projectId: projectId
            }
        });

        res.status(204).send([]);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

// GET route to retrieve an environment
router.get('/', [verifyToken, isUser], async function (req, res, next) {
    const { id, name, projectId, environmentId } = req.query;
    const prisma = req.prisma;

    // Validate query parameters
    if (environmentId) {
        return res.status(400).send("No such parameter as environmentId. Use id instead.");
    }

    try {
        if (id) {
            if (name || projectId) {
                return res.status(400).send("Either environment id or environment name and projectId");
            }

            const environment = await prisma.environment.findUnique({ where: { id: id } });
            return res.send(environment);
        } else if (name) {
            if (!projectId) {
                return res.status(400).send("Environment name requires projectId (think dev, main, etc.)");
            } else {
                const environment = await prisma.environment.findUnique({ where: { name: name, projectId: projectId } });
                if (environment) {
                    return res.send(environment);
                } else {
                    return res.status(404).send(`Could not find environment with name ${name} for projectId ${projectId}`);
                }
            }
        } else {
            const allEnvironments = await prisma.environment.findMany();
            return res.send(allEnvironments);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

module.exports = router;
