module.exports = function(app){
    const utils = require('../controllers/utils')
    app
        .route('/excel')
        .get(utils.JSONToExcel)
        .post(utils.excelToJSON)
        .put(utils.updateInBatch)
}
