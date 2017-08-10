const Genre = require('mongoose').model('Genre')
const Entity = require('mongoose').model('Entity')
const Attribute = require('mongoose').model('Attribute')
const Utils = require('../utils/controller')

exports.create = function(req, res, next){
    const genre = new Genre(req.body)
    genre.save(err => {
        if (err) {
            return res.status(400).send({
                message: parseError(err)
            })
        } else {
            res.status(200).json(genre)
        }
    })
}

exports.list = function(req, res, next){
    let query = Utils.list(req, Genre)
    query
        .populate('SYS_ENTITY')
        .exec((err, genres) => {
            if (err){
                return res.status(400).send({
                    message: parseError(err)
                })
            } else {
                res.status(200).json(genres)
            }
        })
}

// Actions with ID specified

exports.getGenreById = function(req, res, next, id) {
    if (id == 'undefined' || !ObjectId.isValid(id)){
        return res.status(400).send({
            message:"invalid id"
        })
    }

    Genre.findOne(
        {_id: id},
        (err, genre) => {
            if (err) {
                return res.status(400).send({
                    message: parseError(err)
                })
                // without next method, IMO
            } else {
                req.genre = genre
                next() // important
            }
        }
    )
        .populate('SYS_ENTITY')
}

exports.read = function(req, res) {
    res.status(200).json(req.genre)
}

exports.update = function(req, res, next){
    req.body.updatedAt = Date.now()
    Genre.findByIdAndUpdate(
        req.genre.id,
        req.body, 
        {'new': true},
        (err, genre) => {
            if (err) {
                return res.status(400).send({
                    message: parseError(err)
                })
            } else {
                res.status(200).json(genre)
            }
        }
    )
}

exports.delete = function (req, res, next){
    req.genre.remove(err => {
        if (err) {
            return res.status(400).send({
                message: parseError(err)
            })
        } else {
            res.status(200).json(req.genre)
        }
    })
}

exports.attribute = function (req, res, next){
    let newAttributes = []
    Attribute.find(
        {"SYS_GENRE": req.genre.id},
        '',
        (err, attributes) => {
            if (err) {
                return res.status(400).send({
                    message: parseError(err)
                })
            }else{
                res.status(200).json(attributes)
            }
        })
        .populate("SYS_TYPE_ENTITY")

}

exports.entity = function (req, res, next){
    Entity.find(
        {"SYS_GENRE": req.genre.id},
        '',
        (err, entities) => {
            if (err) {
                return res.status(400).send({
                    message: parseError(err)
                })
            } else {
                res.status(200).json(entities)
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

//exports.list = function(req, res, next){
//genreList = [
//{id: 1,
//label: "Genre A"},
//{id: 2,
//label: "Genre B"}
//]
//res.status(200).json(genreList)
//}

