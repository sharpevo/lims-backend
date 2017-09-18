module.exports = function(app){
    const utils = require('../controllers/utils')
    app
        .route('/excel')
        .post(utils.JSONToExcel)
        .put(utils.updateInBatch)
    app
        .route('/excelparse')
        .post(utils.excelToJSON)
}
