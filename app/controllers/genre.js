exports.list = function(req, res, next){
  genreList = [
    {id: 1,
      label: "Genre A"},
    {id: 2,
      label: "Genre B"}
  ]
  res.status(200).json(genreList)
}

