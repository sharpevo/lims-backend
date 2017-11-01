const Attribute = require('mongoose').model('Attribute')
const Genre = require('mongoose').model('Genre')
const Entity = require('mongoose').model('Entity')

const formidable = require('formidable')
const XLSX = require('xlsx')

exports.setCookie = function(req, res, next){
    let token = req.query.token
    let remember = req.query.remember
    console.log("param", token, remember)
    if (token) {
        res.cookie("token", token)
        res.status(200).json({
            "message": "success"
        })
    } else {
        res.status(200).json({
            "errmsg": "invalid request"
        })
    }
    return
}

exports.getUserInfo = function(req, res, next){
    console.log("headers", req.headers)
    let id = req.headers["igenetech-user-id"]
    let name = req.headers["igenetech-user-name"]
    let email = req.headers["igenetech-user-email"]
    let role = req.headers["igenetech-user-roles"]

    if (id) {
        res.status(200).json({
            "id": id,
            "name": name,
            "email": email,
            "role": role,
        })
    } else {
        res.status(400).json({
            "errmsg": "invalid request"
        })
    }
}

exports.excelToJSON = function(req, res, next){
    let form = new formidable.IncomingForm()

    form.parse(req)

    form.on('file', function(name, file){
        console.log(name)
        console.log(file.path)

        let workbook = XLSX.readFile(file.path)
        //let workbook = XLSX.read(file, {type:'binary'})
        let sheet_name_list = workbook.SheetNames
        let jsonObject = []
        let dateRegexp = /^[0-9]{4}[\.][0-9]{2}[\.][0-9]{2}$/i
        sheet_name_list.forEach(function(y) {
            let worksheet = workbook.Sheets[y]
            let headers = {}
            let data = []
            let auxiliaryCol = ""
            for(z in worksheet) {
                if(z[0] === '!') continue
                //parse out the column, row, and value
                let tt = 0
                for (let i = 0; i < z.length; i++) {
                    if (!isNaN(z[i])) {
                        tt = i
                        break
                    }
                }

                let col = z.substring(0,tt)
                let row = parseInt(z.substring(tt))
                let value = worksheet[z].v
                let type = worksheet[z].t

                if (type == 's' && dateRegexp.test(value)) {
                    test = new Date(value)
                    test.setUTCHours(test.getUTCHours() + 8)
                    value = test
                }

                //store header names
                // Note that string comparision of js is lexicographically.
                // i.e., "A" < "B"
                if(row == 1 && value &&
                    (!auxiliaryCol || col <= auxiliaryCol)) {
                    headers[col] = value
                    if (value.startsWith("IDENTIFIER")){
                        auxiliaryCol = col
                    }
                    continue
                }

                if(!data[row]) data[row]={}
                if (!auxiliaryCol || col <= auxiliaryCol){
                    data[row][headers[col]] = value
                }
            }
            //drop those first two rows which are empty
            data.shift()
            data.shift()
            jsonObject.push(data)
        })
        res.status(200).json(jsonObject)

    })
    //var form = new formidable.IncomingForm()

    //form.parse(req)

    //form.on('fileBegin', function (name, file){
    //file.path = '/home/yang/nodejs/igenetech/lims-backend/uploads/' + file.name
    //})

    //form.on('file', function (name, file){
    //console.log('Uploaded ' + file.name)
    //})

    ////res.sendFile(__dirname + '/index.html')
    //res.status(200).json("uploaded")
}

exports.JSONToExcel = function(req, res, next){
    //if (!req.query.ids){
    //res.status(400).json('invalid arguments')
    //return
    //}
    //let ids = req.query.ids.split(',')
    //console.log(">>", req.body)
    // e.g., key = "cap-20170201"
    let workcenterId = req.body['workcenterId']
    let hybridObjectMap = req.body['hybridObjectMap']
    let exportSampleIdListObject = {} // only one sample for each hybrid sample
    let hybridObjectMapKeyList = Object.keys(hybridObjectMap)
    let auxiliaryAttributeObject = hybridObjectMap[hybridObjectMapKeyList[0]]['attributeObject']
    hybridObjectMapKeyList.forEach(key => { // key = sample id
        let sampleIdList = hybridObjectMap[key]['sampleIdList']
        exportSampleIdListObject[sampleIdList[0]] = sampleIdList
        //exportSampleIdList.push(sampleIdList[0])
    })
    console.log("Export Excel:", hybridObjectMap)

    // Get workcenter
    Entity.findOne(
        {_id: workcenterId},
        (err, workcenterDoc) => {
            if(workcenterDoc){

                // Get genre
                Genre.findOne(
                    {"SYS_ENTITY": workcenterDoc},
                    (err, genreDoc) => {

                        // Get attribute
                        Attribute.find(
                            {"SYS_GENRE": genreDoc._id},
                            '',
                            {
                                sort: {
                                    SYS_ORDER: 1
                                }
                            },
                            (err, attributeDocList) => {
                                let headers = []
                                let fields = []
                                let types = []

                                attributeDocList.forEach(attributeDoc => {

                                    let attributeObject = JSON.parse(JSON.stringify(attributeDoc))

                                    // Export non-entity attributes or refered entities
                                    // Never export BoM or Routing of which SYS_TYPE_ENTITY_REF is false
                                    if (attributeObject.SYS_TYPE != 'entity' ||
                                        attributeObject.SYS_TYPE_ENTITY_REF){ // Not export BoM or Routing
                                        headers.push(attributeObject[attributeObject['SYS_LABEL']])
                                        fields.push(attributeObject['SYS_CODE'])
                                        types.push(attributeObject['SYS_TYPE'])
                                    }
                                })

                                headers.push('IDENTIFIER')
                                fields.push('id')
                                types.push('string')

                                // Processing auxiliary attributes
                                // null or undefined can not be converted to object
                                if (auxiliaryAttributeObject){
                                    Object.keys(auxiliaryAttributeObject).forEach(key => {
                                        let attributeObject = auxiliaryAttributeObject[key]
                                        headers.push(attributeObject['SYS_LABEL'])
                                        fields.push(attributeObject['SYS_CODE'])
                                        types.push(attributeObject['SYS_TYPE'])
                                    })
                                }

                                let data = []

                                Entity.find(
                                    {_id: {$in: Object.keys(exportSampleIdListObject)}},
                                    (err, entityDocList) => {

                                        let hybridCode = {}

                                        entityDocList.filter(entityDoc => {
                                            //console.log("!", entityDoc)
                                            return true
                                        }).forEach(entityDoc => {
                                            let entityObject = JSON.parse(JSON.stringify(entityDoc))
                                            let result = {}
                                            let isAuxiliaryAttribute = false
                                            fields.forEach((key, index) => {

                                                if (!isAuxiliaryAttribute){
                                                    // Export SYS_LABEL rather id
                                                    if (types[index] == 'entity'){

                                                        // TODO: async
                                                        Entity.findOne(
                                                            {_id: entityObject[key]},
                                                            (err, innerEntityDoc) => {
                                                                if (innerEntityDoc){
                                                                    let innerEntityObject = JSON.parse(JSON.stringify(innerEntityDoc))
                                                                    result[key] = innerEntityObject[innerEntityObject['SYS_LABEL']]
                                                                }
                                                            })

                                                    } else if (key == 'id'){
                                                        isAuxiliaryAttribute = true
                                                        //let position = exportSampleIdList.indexOf(result[key])
                                                        result[key] = exportSampleIdListObject[entityObject[key]]
                                                    } else {
                                                        result[key] = entityObject[key]?entityObject[key]:''
                                                    }
                                                } else {
                                                    //result[key] = hybridObjectMap[entityObject['SYS_SAMPLE_CODE']][key]['value']
                                                    console.log("-------", entityObject._id)
                                                    if (hybridObjectMap[entityObject._id]['attributeObject']) {
                                                        result[key] = hybridObjectMap[entityObject._id]['attributeObject'][key]['value']
                                                    }

                                                }
                                                //console.log("..", result)
                                            })
                                            data.push(result)
                                        })


                                        let _headers = headers
                                            .map((v, i) => Object.assign({}, {v: v, position: String.fromCharCode(65+i) + 1 }))
                                            .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
                                        let _data = data
                                            .map((v, i) => fields.map((k, j) => Object.assign({}, { v: v[k], position: String.fromCharCode(65+j) + (i+2) })))
                                            .reduce((prev, next) => prev.concat(next))
                                            .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
                                        let output = Object.assign({}, _headers, _data)
                                        let outputPos = Object.keys(output)
                                        let ref = outputPos[0] + ':' + outputPos[outputPos.length - 1]
                                        let wb = {
                                            SheetNames: ['samples'],
                                            Sheets: {
                                                'samples': Object.assign({}, output, { '!ref': ref })
                                            }
                                        }

                                        let timestamp = getTimestamp()
                                        let tempfile = `tempfolder/${timestamp}.${req.body.workcenterId}.xlsx`
                                        XLSX.writeFile(wb, tempfile)
                                        res.download(tempfile)

                                    })
                            })

                    })
            } else {
                res.status(400).json('invalid workcenter id: ' + workcenterId)
                return
            }
        })


    return

    let entity = Entity.findOne(
        {_id: ids[0]},
        (err, entity) => {
            if (!entity){
                console.log("entity:", entity)
                res.status(400).json('invalid id')
                return
            }

            Entity.findOne(
                {_id: req.body.workcenterId},
                (err, entity) => {
                    if (entity){
                        Genre.findOne(
                            {"SYS_ENTITY": entity._id},
                            (err, genre) => {

                                Attribute.find(
                                    {'SYS_GENRE': genre._id},
                                    '',
                                    {
                                        sort:{
                                            SYS_ORDER: 1
                                        }
                                    },
                                    (err, attributes) => {
                                        let headers = []
                                        let fields = []
                                        let types = []
                                        attributes.forEach(attribute => {
                                            let attr = JSON.parse(JSON.stringify(attribute))

                                            // Export non-entity attributes or refered entities
                                            // Never export BoM or Routing of which SYS_TYPE_ENTITY_REF is false
                                            if (attr.SYS_TYPE != 'entity' || attr.SYS_TYPE_ENTITY_REF){ // Never export BoM or Routing
                                                headers.push(attr[attr['SYS_LABEL']])
                                                fields.push(attr['SYS_CODE'])
                                                types.push(attr['SYS_TYPE'])
                                            }
                                        })
                                        headers.push('IDENTIFIER')
                                        fields.push('id')
                                        types.push('string')

                                        // Prepare data
                                        let data = []
                                        Entity.find(
                                            {_id: {$in: ids}},
                                            (err, entities) => {
                                                let hybridCode = {}


                                                entities.filter(entity => {
                                                    console.log("!", entity)
                                                    //console.log("!", entity.SYS_HYBRID_INFO)
                                                    return true
                                                }).forEach(entity => {
                                                    let e = JSON.parse(JSON.stringify(entity))
                                                    let object = {}
                                                    fields.forEach((key, index) => {

                                                        // Export SYS_LABEL rather id
                                                        if (types[index] == 'entity'){

                                                            // TODO: async
                                                            Entity.findOne(
                                                                {_id: e[key]},
                                                                (err, _entityAttr) => {
                                                                    let entityAttr = JSON.parse(JSON.stringify(_entityAttr))
                                                                    object[key] = entityAttr[entityAttr['SYS_LABEL']]
                                                                })

                                                            //} else {
                                                        }
                                                        object[key] = e[key]?e[key]:''
                                                    })
                                                    data.push(object)
                                                })

                                                let _headers = headers
                                                    .map((v, i) => Object.assign({}, {v: v, position: String.fromCharCode(65+i) + 1 }))
                                                    .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
                                                let _data = data
                                                    .map((v, i) => fields.map((k, j) => Object.assign({}, { v: v[k], position: String.fromCharCode(65+j) + (i+2) })))
                                                    .reduce((prev, next) => prev.concat(next))
                                                    .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
                                                let output = Object.assign({}, _headers, _data)
                                                let outputPos = Object.keys(output)
                                                let ref = outputPos[0] + ':' + outputPos[outputPos.length - 1]
                                                let wb = {
                                                    SheetNames: ['samples'],
                                                    Sheets: {
                                                        'samples': Object.assign({}, output, { '!ref': ref })
                                                    }
                                                }

                                                let timestamp = getTimestamp()
                                                let tempfile = `tempfolder/${timestamp}.${req.body.workcenterId}.xlsx`
                                                XLSX.writeFile(wb, tempfile)
                                                //res.setHeader('Content-Type', "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                                                //res.setHeader("Content-Disposition", "attachment; filename=deployment-definitions.xlsx");
                                                res.download(tempfile)

                                                //let stream = XLSX.stream.to_csv(wb)//.pipe(res)
                                                //fs.createWriteStream('tttt.xlsx')
                                                //res.end()
                                                //var output_file_name = "out.csv";
                                                //var stream = XLSX.stream.to_csv(wb);
                                                //res.setHeader('Content-Type', "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                                                //res.setHeader("Content-Disposition", "attachment; filename=deployment-definitions.xlsx");
                                                //console.log(stream)
                                                //let file = fs.createWriteStream(output_file_name)
                                                //res.pipe(wb)
                                                //stream.pipe(fs.createWriteStream(output_file_name))
                                                //res.download(output_file_name)
                                                //stream.pipe(res)
                                                //res.send(stream)
                                            })


                                    }
                                )
                            })
                    } else {

                        res.status(400).json('invalid workcenter id: '+req.body.workcenterId)
                        return
                    }
                })



        }
    )

}

exports.updateInBatch = function(req, res, next){
    let entityList = req.body
    let errMsg = {}

    // Get attributes

    // TODO: Validate attributes

    // update
    entityList.forEach(entityObject => {
        if (!entityObject['IDENTIFIER']){
            errMsg['identifier'] = 'Invalid identifier'
        }
        Entity.findOne(
            {_id: entityObject['IDENTIFIER']},
            (err, entity) => {
                if (!entity){
                    errMsg[entityObject['IDENTIFIER']] = 'Invalid sample'
                    return
                }
                let obj = {}
                let isUpdated = false
                Attribute.find(
                    {'SYS_GENRE': entity.SYS_GENRE},
                    '',
                    (err, attributes) => {
                        let attrMap = {}
                        attributes.forEach(attribute => {
                            let attr = JSON.parse(JSON.stringify(attribute))
                            attrMap[attr[attr['SYS_LABEL']]] = attr['SYS_CODE']
                        })

                        Object.keys(entityObject).forEach(key => {
                            if (attrMap[key]){
                                isUpdated = true
                                obj[attrMap[key]] = entityObject[key]
                            }
                        })

                        if (isUpdated){
                            Entity.findByIdAndUpdate(
                                entity.id,
                                obj,
                                {'new': true},
                                (err, entity) => {
                                    if (err) {
                                        errMsg[entity.id] = parseError(err)
                                    }
                                }
                            )
                        }

                    }
                )

            })

    })

    if (Object.keys(errMsg).length > 0) {
        res.status(400).json(JSON.stringify(errMsg))
    } else {
        res.status(200).json('success')
    }

}

function getTimestamp() {
    let str = ""

    let currentTime = new Date()
    let year = currentTime.getFullYear()
    let month = currentTime.getMonth() + 1
    let day = currentTime.getDate()
    let hours = currentTime.getHours()
    let minutes = currentTime.getMinutes()
    let seconds = currentTime.getSeconds()

    if (month < 10) {
        month = "0" + month
    }
    if (day < 10) {
        day = "0" + day
    }
    if (minutes < 10) {
        minutes = "0" + minutes
    }
    if (seconds < 10) {
        seconds = "0" + seconds
    }
    str += year + month + day + '_' + hours + minutes + seconds
    return str
}

const parseError = function(err) {
    if (err.errors) {
        for (const errName in err.errors){
            if (err.errors[errName].message) return err.errors[errName].message
        }
    } else {
        console.error(err)
        return 'Unknown server errer'
    }
}
