const router = require('./routes/user.routes');

module.exports = {
  router,
  userDirectory: require('./services/userDirectory'),
  userService: require('./services/user.service'),
};