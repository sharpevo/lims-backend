const Attribute = require('mongoose').model('Attribute')
const Genre = require('mongoose').model('Genre')

exports.create = function(req, res, next){
    let attribute = new Attribute(req.body) // perfect
    attribute
        .save()
        .then((attribute) =>{
            if (!attribute) {
                console.error('failed to locate attribute:', attribute)
                return
            }
            console.log('genre id:', req.body.SYS_GNERE)
            //Genre.findById(req.body.SYS_GENRE, (err, genre) => {
            //console.log('genre id:', attribute.SYS_GENRE)
            Genre.findById(attribute.SYS_GENRE, (err, genre) => {
                if (err){
                    console.error('error:', err)
                    return
                }
                if (!genre){
                    console.error('failed to locate genre:', err)
                    return
                }
                genre.SYS_ATTRIBUTE_LIST.push(attribute)
                genre.save()
                res.status(200).json(attribute)
            })
        }).catch((err) => {
            console.log(err)
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
    Attribute.find(req.query, '', options, (err, attributes) => {
        if (err){
            return res.status(400).send({
                message: parseError(err)
            })
        } else {
            res.status(200).json(attributes)
        }
    })
        .populate('SYS_GENRE')
}

// Actions with ID specified

exports.getAttributeById = function(req, res, next, id) {
    Attribute.findOne(
        {_id: id},
        (err, attribute) => {
            if (err) {
                return res.status(400).send({
                    message: parseError(err)
                })
                // without next method, IMO
            } else {
                req.attribute = attribute
                next() // important
            }
        }
    )
}

exports.read = function(req, res) {
    res.json(req.attribute)
}

exports.update = function(req, res, next){
    req.body.updatedAt = Date.now()
    Attribute.findByIdAndUpdate(
        req.attribute.id,
        req.body, 
        {'new': true},
        (err, attribute) => {
            if (err) {
                return res.status(400).send({
                    message: parseError(err)
                })
            } else {
                res.status(200).json(attribute)
            }
        }
    )
}

exports.delete = function (req, res, next){
    req.attribute.remove(err => {
        if (err) {
            return res.status(400).send({
                message: parseError(err)
            })
        } else {
            res.status(200).json(req.attribute)
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
