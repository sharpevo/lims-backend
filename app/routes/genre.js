module.exports = function(app) {
  const genre = require('../controllers/genre')
  app
    .route('/genre')
    .get(genre.list)
}
