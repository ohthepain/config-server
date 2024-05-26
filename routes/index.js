"use strict";
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/environment-id', async function(req, res, next) {
    const prisma = req.prisma
    const { projectName, environmentName } = req.query;

    try {
        const project = await prisma.project.findUnique({ where: { name: projectName }})
        const environment = await prisma.environment.findUnique({ where: { name: environmentName, projectId: project.id }})
        if (!environment) {
            return res.status(404).send('environment not found');
        }
        return res.status(200).send({ id: environment.id });
    } catch(error) {
        console.log(error.message);
        next(error);
    }
});  

router.get('/config-info', async function(req, res, next) {
    const prisma = req.prisma
    const { environmentId } = req.query;

    try {
        const environment = await prisma.environment.findUnique({ where: { id: environmentId }})
        if (!environment) {
            return res.status(404).send('environment not found');
        }

        const config = await prisma.config.findUnique({ where: { id: environment.configId }})
        return res.status(200).send(config);
    } catch(error) {
        console.log(error.message);
        next(error);
    }
});  

module.exports = router;
