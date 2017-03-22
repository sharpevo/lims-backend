module.exports = function(app) {
  const entity = require('../controllers/entity')
  app
    .route('/entity')
    .get(entity.list)
}
