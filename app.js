require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const bodyParser = require('body-parser');
const { authenticate, authorize } = require('./middleware/auth');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const userRouter = require('./routes/user');
const categoriesRouter = require('./routes/categories');
const categoryRouter = require('./routes/category');
const exchangeRoutes = require('./routes/exchange');
const exchangesRoutes = require('./routes/exchanges');
const typeReportsRoutes = require('./routes/typeReports');
const typeReportRoutes = require('./routes/typeReport');
const objectsRoute = require('./routes/objects');
const objectRoute = require('./routes/object');
const authRoutes = require('./routes/auth');
const reportsRoute = require('./routes/reports');
const reportRoute = require('./routes/report');
const defineAssociations = require('./models/associations');
const exchangeObjectsRoute = require('./routes/exchangeObjects');
const exchangeObjectRoute = require('./routes/exchangeObject');
const registerRoute = require('./routes/register');
const dashboardRoute = require('./routes/dashboard');

const { ADMIN_PROFILE, STANDARD_PROFILE } = process.env;
var app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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

app.use(prefix + '/dashboard', authenticate, authorize([ADMIN_PROFILE]), dashboardRoute);
app.use(prefix + '/user', authenticate, authorize([ADMIN_PROFILE, STANDARD_PROFILE]), userRouter);
app.use(prefix + '/users', authenticate, authorize([ADMIN_PROFILE, STANDARD_PROFILE]), usersRouter);
app.use(prefix + '/categories', categoriesRouter);
app.use(prefix + '/category', authenticate, authorize([ADMIN_PROFILE]), categoryRouter);
app.use(prefix + '/exchange', authenticate, authorize([ADMIN_PROFILE, STANDARD_PROFILE]), exchangeRoutes);
app.use(prefix + '/exchanges', authenticate, authorize([ADMIN_PROFILE, STANDARD_PROFILE]), exchangesRoutes);
app.use(prefix + '/typeReports', authenticate, authorize([ADMIN_PROFILE, STANDARD_PROFILE]), typeReportsRoutes);
app.use(prefix + '/typeReport', authenticate, authorize([ADMIN_PROFILE]), typeReportRoutes);
app.use(prefix + '/objects', objectsRoute);
app.use(prefix + '/object', objectRoute);
app.use(prefix + '/reports', authenticate, authorize([ADMIN_PROFILE, STANDARD_PROFILE]), reportsRoute);
app.use(prefix + '/report', authenticate, authorize([ADMIN_PROFILE]), reportRoute);
app.use(prefix + '/exchangeObjects',authenticate,authorize([ADMIN_PROFILE, STANDARD_PROFILE]),exchangeObjectsRoute);
app.use(prefix + '/exchangeObject',authenticate,authorize([ADMIN_PROFILE, STANDARD_PROFILE]),exchangeObjectRoute);

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
