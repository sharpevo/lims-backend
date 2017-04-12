
exports.list = function(req, model){
    let where_params = ""
        , limit_params = ""
        , skip_params = ""
        , sort_params = ""
        , select_params = ""

    if (req.query.limit){
        limit_params = parseInt(req.query.limit)
        delete req.query["limit"]
    }

    if (req.query.skip){
        skip_params = parseInt(req.query.skip)
        delete req.query["skip"]
    }

    if (req.query.where){
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

    let query = model.find(req.query)

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
    return query
}
