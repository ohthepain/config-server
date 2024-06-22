"use strict";
var express = require("express");
var router = express.Router();

const { verifyToken, isAdmin, isUser } = require("../middleware/authJwt");

router.put("/", [verifyToken, isAdmin], async function (req, res, next) {
  const project = req.body;
  if (!project.name) {
    return res.status(400).send("Project name is required");
  }

  try {
    const prisma = req.prisma;
    if (project.id) {
      const updatedProject = await prisma.project.update({
        where: {
          id: project.id,
        },
        data: {
          name: project.name,
          gitRepo: project.gitRepo,
          bucket: project.bucket,
        },
      });
      res.send(updatedProject);
    } else {
        const newProject = await prisma.project.create({
          data: {
            name: project.name,
            gitRepo: project.gitRepo,
            bucket: project.bucket,
          },
        });
        res.status(201).send(newProject);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete("/", [verifyToken, isAdmin], async function (req, res, next) {
  const { id, name, ignoreErrors } = req.query;
  if (!name && !id) {
    return res.status(400).send("Project name or id is required");
  }

  if (name && id) {
    return res.status(400).send("Project name or id is required but not both");
  }

  try {
    const prisma = req.prisma;
    if (id) {
      await prisma.project.delete({
        where: {
          id: id,
        },
      });
    } else {
      await prisma.project.delete({
        where: {
          name: name,
        },
      });
    }
    res.status(204).send([]);
  } catch (error) {
    if (ignoreErrors) {
      res.status(204).send([]);
    } else {
      console.log(error);
      next(error);
    }
  }
});

router.get("/", [verifyToken, isUser], async function (req, res, next) {
  // res.render('index', { title: 'Projects' });
  const allProjects = await req.prisma.project.findMany();
  res.send(allProjects);
});

module.exports = router;
