"use strict";
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');

const tracer = require('dd-trace').init({
    service: 'config-server',
    env: 'PROD',
    logInjection: true,
    analytics: true
});

var indexRouter = require('./routes/index');
var configsRouter = require('./routes/configs');
var branchesRouter = require('./routes/branches');
var environmentsRouter = require('./routes/environments');
var authRouter = require('./routes/auth');
var usersRouter = require('./routes/users');
var projectsRouter = require('./routes/projects');

const { PrismaClient } = require('@prisma/client')

var app = express();

const prisma = new PrismaClient()

app.use(async (req, res, next) => {
  req.prisma = prisma
  req.tracer = tracer
  next()
})

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/configs', configsRouter)
app.use('/api/branches', branchesRouter)
app.use('/api/environments', environmentsRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/auth', authRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

process.on("SIGTERM", async (signal) => {
  console.log(`Process ${process.pid} received a SIGTERM signal`);
  await prisma.$disconnect()
  process.exit(0);
});

module.exports = app;
