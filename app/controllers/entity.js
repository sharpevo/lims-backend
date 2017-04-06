const Attribute = require('mongoose').model('Attribute')
const Genre = require('mongoose').model('Genre')
const Entity = require('mongoose').model('Entity')

exports.create = function(req, res, next){
    const entity = new Entity(req.body) // perfect
    // rather than setter modifier
    entity.SYS_GENRE_IDENTIFIER = entity.SYS_IDENTIFIER.substr(0, entity.SYS_IDENTIFIER.lastIndexOf("/")+1)
    entity.save((err) => {
        if (err) {
            return res.status(400).send({
                message: parseError(err)
            })
        } else {
            res.status(200).json(entity)
        }
    })
}

exports.list = function(req, res, next){
    let limit_params = ""
    let skip_params = ""
    let sort_params = ""
    let where_params = ""
    let select_params = ""
    //console.log(req.query)
    if (req.query.limit){
        limit_params = parseInt(req.query.limit)
        delete req.query["limit"]
    }

    if (req.query.skip){
        skip_params = parseInt(req.query.skip)
        delete req.query["skip"]
    }

    if (req.query.where){
        //where_params = req.query.where
        //delete req.query["where"]
        try {
            where_params = JSON.parse(req.query.where)
            delete req.query["where"]
        } catch (e) {
            console.error('invalid json object')
        }
    }

    if (req.query.sort){
        sort_params = req.query.sort
        delete req.query["sort"]
    }

    if (req.query.select){
        select_params = req.query.select
        delete req.query["select"]
    }

    let query = Entity.find(req.query)

    if (where_params){
        // the `where` parameter is formed like:
        // {
        //    "SYS_ENTITY_TYPE": {
        //        "=": "class"
        //    },
        //    "SYS_IDENTIFIER": {
        //        "regex": "/BOM/"
        //    }
        //}
        // Note that the regex is strings in the slashes
        Object.keys(where_params).forEach((key) => { // key = field
            Object.keys(where_params[key]).forEach((operation) => {
                switch (operation) {
                    case "regex":
                        //console.log(key)
                        //console.log(where_params[key]["regex"])
                        query.where(key).regex(where_params[key]["regex"])
                        //query.where("SYS_IDENTIFIER").regex("/MATERIAL$")
                        break
                    case "=":
                        //console.log(key)
                        //console.log(where_params[key]["="])
                        query.where(key).equals(where_params[key]["="])
                        break
                    default:
                        console.log("invalid operation")
                }

            })
        })
    }

    if (limit_params){
        query.limit(limit_params)
    }

    if (skip_params){
        query.skip(skip_params)
    }

    // sort by "field" ascending and "test" descending
    // query.sort('field -test');
    if (sort_params){
        query.sort(sort_params)
    }

    // not support for the select array currently
    if (select_params){
        //console.log(select_params)
        query.select(select_params)
        //query.select('-SYS_IDENTIFIER')
    }

    query
    //.populate('SYS_GENRE_LIST')
        .exec((err, entities) => {
            if (err){
                return res.status(400).send({
                    message: parseError(err)
                })
            } else {
                res.status(200).json(entities)
            }
        })
}

// Actions with ID specified

exports.getEntityById = function(req, res, next, id) {
    Entity.findOne(
        {_id: id},
        (err, entity) => {
            if (err) {
                return res.status(400).send({
                    message: parseError(err)
                })
                // without next method, IMO
            } else {
                req.entity = entity
                next() // important
            }
        }
    )
    //.populate('SYS_GENRE_LIST')
}

exports.read = function(req, res) {
    res.json(req.entity)
}

exports.update = function(req, res, next){
    req.body.updatedAt = Date.now()
    Entity.findByIdAndUpdate(
        req.entity.id,
        req.body, 
        {'new': true},
        (err, entity) => {
            if (err) {
                return res.status(400).send({
                    message: parseError(err)
                })
            } else {
                res.status(200).json(entity)
            }
        }
    )
}

exports.delete = function (req, res, next){
    req.entity.remove(err => {
        if (err) {
            return res.status(400).send({
                message: parseError(err)
            })
        } else {
            res.status(200).json(req.entity)
        }
    })
}

exports.genre = function (req, res, next){
    Genre.find(
        {"SYS_ENTITY": req.entity.id},
        '',
        (err, genres) => {
            if (err) {
                return res.status(400).send({
                    message: parseError(err)
                })
            } else {
                res.status(200).json(genres)
            }
        })
}

exports.attribute = function (req, res, next){
    console.log(req.entity.SYS_GENRE)
    Attribute.find(
        {"SYS_GENRE": req.entity.SYS_GENRE},
        '',
        (err, attributes) => {
            if (err) {
                return res.status(400).send({
                    message: parseError(err)
                })
            } else {
                res.status(200).json(attributes)
            }
        })
        .populate("SYS_GENRE SYS_TYPE_ENTITY")
}

exports.entity = function (req, res, next){
    let entityType = req.query["SYS_ENTITY_TYPE"]
    if (!entityType){
        entityType = "object"
    }
    Entity.find(
        {
            "SYS_ENTITY_TYPE": entityType,
            "SYS_IDENTIFIER": new RegExp("^" + req.entity.SYS_IDENTIFIER),
        },
        '',
        (err, entities) => {
            if (err) {
                return res.status(400).send({
                    message: parseError(err)
                })
            } else {
                res.status(200).json(entities)
            }
        }
    )
}

const parseError = function(err) {
    if (err.errors) {
        for (const errName in err.errors){
            if (err.errors[errName].message) return err.errors[errName].message
        }
    } else {
        return 'Unknown server errer'
    }
}
