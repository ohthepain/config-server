"use strict";

var express = require('express');
var router = express.Router();
const { verifyToken, isUser, isAdmin } = require('../middleware/authJwt');

// Create or update an environment
router.put('/', [verifyToken, isUser], async function (req, res, next) {
    const {
        id,
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
        awsRegion,
        warningMessage
    } = req.body;

    if (!id && ( !name || !projectId)) {
        return res.status(400).send('Environment: please specify id or name and projectId)');
    }

    try {
        const prisma = req.prisma;

        var environment
        if (id) {
            environment = await prisma.environment.findUnique({ where: { id: id } });
        } else {
            // Check if the project exists
            const project = await prisma.project.findUnique({ where: { id: projectId } });
            if (!project) {
                return res.status(404).send('Project not found');
            }

            environment = await prisma.environment.findUnique({ where: { name: name, projectId: project.id } });
        }

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
                    awsRegion: awsRegion || environment.awsRegion,
                    warningMessage: warningMessage || environment.warningMessage
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
                    awsRegion: "",
                    warningMessage: ""
                }
            });
        }

        res.send(environment);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

// Deploy config to environment
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

router.delete('/', [verifyToken, isAdmin], async function (req, res, next) {
    const { id } = req.query;

    // Validate required fields
    if (!id) {
         return res.status(400).send('No id was provided');
    }

    try {
        const prisma = req.prisma;
        await prisma.environment.delete({ where: { id: id } });
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
        } else if (projectId){
            console.log(`get project environments`)
            const environments = await prisma.environment.findMany({ where: { projectId: projectId } });
            return res.send(environments);
        } else {
            console.log(`get ALL environments`)
            const environments = await prisma.environment.findMany();
            return res.send(environments);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

module.exports = router;
