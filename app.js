require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const { authenticate, authorize } = require('./middleware/auth');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const categoryRouter = require('./routes/category');
const exchangeRoutes = require('./routes/exchange');
const typeReportRoutes = require('./routes/typeReport');
const objectsRoute = require('./routes/objects');
const objectRoute = require('./routes/object');
const authRoutes = require('./routes/auth');
const reportsRoute = require('./routes/reports');
const reportRoute = require('./routes/report');
const defineAssociations = require('./models/associations');
const exchangeObjectRoute = require('./routes/exchangeObject');
const registerRoute = require('./routes/register');

const { ADMIN_PROFILE, STANDARD_PROFILE } = process.env;
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
const prefix = "/api";

app.use('/', indexRouter);
app.use(prefix + '/auth', authRoutes);
app.use(prefix + '/register', registerRoute);

app.use(prefix + '/users', authenticate, authorize([ADMIN_PROFILE]), usersRouter);
app.use(prefix + '/categories', authenticate, authorize([ADMIN_PROFILE, STANDARD_PROFILE]), categoryRouter);
app.use(prefix + '/exchange', authenticate, authorize([ADMIN_PROFILE, STANDARD_PROFILE]), exchangeRoutes);
app.use(prefix + '/typeReports', authenticate, authorize([ADMIN_PROFILE, STANDARD_PROFILE]), typeReportRoutes);
app.use(prefix + '/objects', authenticate, authorize([ADMIN_PROFILE, STANDARD_PROFILE]), objectsRoute);
app.use(prefix + '/object', authenticate, authorize([ADMIN_PROFILE, STANDARD_PROFILE]), objectRoute);
app.use(prefix + '/reports', authenticate, authorize([ADMIN_PROFILE, STANDARD_PROFILE]), reportsRoute);
app.use(prefix + '/report', authenticate, authorize([ADMIN_PROFILE, STANDARD_PROFILE]), reportRoute);
app.use(prefix + '/exchangeObjects',authenticate,authorize([ADMIN_PROFILE, STANDARD_PROFILE]),exchangeObjectRoute);

defineAssociations();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
