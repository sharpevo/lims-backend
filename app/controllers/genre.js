const Genre = require('mongoose').model('Genre')

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
  let options = {}
  if (req.query.limit){
    options["limit"] = parseInt(req.query.limit)
    delete req.query["limit"]
  }
  if (req.query.skip){
    options["skip"] = parseInt(req.query.skip)
    delete req.query["skip"]
  }

  Genre.find(
    req.query,
    '',
    options,
    (err, genres) => {
      if (err){
        return res.status(400).send({
          message: parseError(err)
        })
      } else {
        res.status(200).json(genres)
      }
    })
    .populate('SYS_ATTRIBUTE_LIST SYS_ENTITY')
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

