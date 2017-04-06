module.exports = function(app) {
    const genre = require('../controllers/genre')
    app
        .route('/genre')
        .get(genre.list)
        .post(genre.create)

    app.param('genreId', genre.getGenreById)

    app
        .route('/genre/:genreId')
        .get(genre.read)
        .put(genre.update)
        .delete(genre.delete)

    app
        .route('/genre/:genreId/attribute')
        .get(genre.attribute)

    app
        .route('/genre/:genreId/entity')
        .get(genre.entity)

}
