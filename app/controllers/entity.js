const Attribute = require('mongoose').model('Attribute')
const Genre = require('mongoose').model('Genre')
const Entity = require('mongoose').model('Entity')
const Utils = require('../utils/controller')

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
    let query = Utils.list(req, Entity)
    query
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
    Attribute.find(
        {"SYS_GENRE": req.entity.SYS_GENRE},
        '',
        {
            sort:{
                SYS_ORDER: 1
            }
        },
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
