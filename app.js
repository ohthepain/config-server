var createError = require('http-errors');
"use strict";
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var configsRouter = require('./routes/configs');
var branchesRouter = require('./routes/branches');
var environmentsRouter = require('./routes/environments');
var authRouter = require('./routes/auth');
var usersRouter = require('./routes/users');
var projectsRouter = require('./routes/projects');

const { PrismaClient } = require('@prisma/client')
const { verifyToken } = require('./middleware/authJwt')

var app = express();

const prisma = new PrismaClient()

app.use(async (req, res, next) => {
  req.prisma = prisma
  next()
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
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
