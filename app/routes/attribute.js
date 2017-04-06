module.exports = function(app) {
    const attribute = require('../controllers/attribute')
    app
        .route('/attribute')
        .post(attribute.create)
        .get(attribute.list)

    app.param('attributeId', attribute.getAttributeById)

    app
        .route('/attribute/:attributeId')
        .get(attribute.read)
        .put(attribute.update)
        .delete(attribute.delete)

}
