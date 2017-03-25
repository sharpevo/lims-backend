const Attribute = require('mongoose').model('Attribute')
const Genre = require('mongoose').model('Genre')
const Entity = require('mongoose').model('Entity')

exports.create = function(req, res, next){
    const entity = new Entity(req.body) // perfect
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
    let options = {}
    if (req.query.limit){
        options["limit"] = parseInt(req.query.limit)
        delete req.query["limit"]
    }
    if (req.query.skip){
        options["skip"] = parseInt(req.query.skip)
        delete req.query["skip"]
    }
    Entity.find(req.query, '', options, (err, entities) => {
        if (err){
            return res.status(400).send({
                message: parseError(err)
            })
        } else {
            res.status(200).json(entities)
        }
    })
        .populate('SYS_GENRE_LIST')
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
        .populate('SYS_GENRE_LIST')
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

const parseError = function(err) {
    if (err.errors) {
        for (const errName in err.errors){
            if (err.errors[errName].message) return err.errors[errName].message
        }
    } else {
        return 'Unknown server errer'
    }
}
