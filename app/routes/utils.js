module.exports = function(app){
    const utils = require('../controllers/utils')
    app
        .route('/')
        .get(utils.setCookie)
    app
        .route('/userinfo')
        .get(utils.getUserInfo)
    app
        .route('/excel')
        .post(utils.JSONToExcel)
        .put(utils.updateInBatch)
    app
        .route('/excelparse')
        .post(utils.excelToJSON)
}
