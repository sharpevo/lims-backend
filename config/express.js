const config = require('./config')
const express = require('express')
const morgan= require('morgan')
const compress = require('compression')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
//const session = require('express-session')

module.exports = function() {

    const Entity = require('mongoose').model('Entity')
    const app = express()
    var limsId = ""
    if (process.env.NODE_ENV === 'development'){
        app.use(morgan('dev'))
    } else if (process.env.NODE_ENV === 'production') {
        app.use(compress())
    }
    app.use(bodyParser.json({limit: '50mb'}))
    app.use(bodyParser.urlencoded({
        extended: true
    }))
    app.use(bodyParser.json())
    app.use(methodOverride())
    app.all('*', function(req, res, next) {
        if (config.corsOrigin.includes(req.headers.origin)) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.header(
                'Access-Control-Expose-Headers',
                'igenetech-user-id,igenetech-user-name,igenetech-user-email,igenetech-user-roles,igenetech-user-role,igenetech-user-limsid')
            res.header('Access-Control-Allow-Credentials', 'true')
        }
        next();
    });

    app.use((req, res, next) => {
        idKey = 'igenetech-user-id'
        limsIdKey = 'igenetech-user-limsid'
        nameKey = 'igenetech-user-name'
        emailKey = 'igenetech-user-email'
        rolesKey = 'igenetech-user-roles'
        roleKey = 'igenetech-user-role'

        if (!req.headers[limsIdKey] && req.headers[emailKey]) {
            Entity.find({
                "SYS_USER_EMAIL": req.headers[emailKey],
            }, (err, entities) =>  {
                if (entities.length == 0 || err){
                    limsId = ""
                } else {
                    limsId = entities[0].id
                }
                res.header(idKey, req.headers[idKey])
                res.header(limsIdKey, limsId)
                res.header(nameKey, req.headers[nameKey])
                res.header(emailKey, req.headers[emailKey])
                res.header(rolesKey, req.headers[rolesKey])
                res.header(roleKey, req.headers[roleKey])
                next()
            })
        } else {
            res.header(idKey, req.headers[idKey])
            res.header(limsIdKey, limsId)
            res.header(nameKey, req.headers[nameKey])
            res.header(emailKey, req.headers[emailKey])
            res.header(rolesKey, req.headers[rolesKey])
            res.header(roleKey, req.headers[roleKey])
            next()
        }
    })

    require('../app/routes/entity')(app)
    require('../app/routes/genre')(app)
    require('../app/routes/attribute')(app)
    require('../app/routes/utils')(app)


    //app.use(session({
    //saveUninitialized: true,
    //resave: true,
    //secret: config.sessionSecret
    //}))

    //app.set('views', './app/views')
    //app.set('view engine', 'ejs')

    //require('../app/routes/index.server.routes.js')(app)
    //require('../app/routes/users.server.routes.js')(app)

    //app.use(express.static('./public'))
    return app
}
