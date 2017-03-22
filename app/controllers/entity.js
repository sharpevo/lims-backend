exports.list = function(req, res, next){
  entityList = [
    {id: 1,
      label: "Entity A"},
    {id: 2,
      label: "Entity B"}
  ]
  res.status(200).json(entityList)
}

