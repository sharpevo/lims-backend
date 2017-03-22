module.exports = function(app) {
  const index = require('../contrllers/index.server.controller')
  app.get('/*', index.render)
}

