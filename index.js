process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const configureMongoose = require('./config/mongoose')
const configureExpress = require('./config/express')

const db = configureMongoose()
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    // after configureMongoose()
    const configureTestDatabase = require('./scripts/init_test_db')
    configureTestDatabase()
}
const app = configureExpress()
app.listen(3000)

module.exports = app
console.log('Server running at 3000')
