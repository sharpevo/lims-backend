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
const port = process.env.NODE_PORT || 3000
app.listen(port)

module.exports = app
console.log('Server running at ' + port)
