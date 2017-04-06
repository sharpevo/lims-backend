module.exports = function(app) {
    const entity = require('../controllers/entity')
    app
        .route('/entity')
        .post(entity.create)
        .get(entity.list)

    app.param('entityId', entity.getEntityById)

    app
        .route('/entity/:entityId')
        .get(entity.read)
        .put(entity.update)
        .delete(entity.delete)

    app
        .route('/entity/:entityId/genre')
        .get(entity.genre)

    app
        .route('/entity/:entityId/attribute')
        .get(entity.attribute)

    app
        .route('/entity/:entityId/entity')
        .get(entity.entity)
}
