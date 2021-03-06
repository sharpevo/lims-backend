const config = require('./config')
const mongoose = require('mongoose')

module.exports = function(){
  mongoose.Promise = global.Promise;
  const db = mongoose.connect(config.db)
  require('../app/models/attribute')
  require('../app/models/genre')
  require('../app/models/entity')
  return db
}
