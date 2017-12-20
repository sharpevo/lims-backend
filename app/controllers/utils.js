const path = require('path')
const config = require(path.join(__dirname, '../../config/config.js'))
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
        let expires = new Date()
        let minutes = 30
        if (remember == "true"){
            minutes = 43200 // 30 * 24 * 60
        }
        expires.setTime(expires.getTime() + minutes * 60 * 1000)
        res.cookie("token", token, {expires: expires, httpOnly: true})
        res.status(200).json({
            "message": "success"
        })
    } else {
        return res.redirect(config.frontendUrl)
    }
    return
}

exports.getUserInfo = function(req, res, next){
    let id = req.headers["igenetech-user-id"]
    let name = req.headers["igenetech-user-name"]
    let email = req.headers["igenetech-user-email"]
    let roles = req.headers["igenetech-user-roles"]
    let role = req.headers["igenetech-user-role"]

    if (id) {
        res.status(200).json({
            "id": id,
            "name": name,
            "email": email,
            "roles": roles,
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

    form.parse(req, function(err, fields, files) {
        if (err) next(err);
    })

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

exports.JSONToExcel = async function(req, res, next){
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
    let auxiliaryAttributeObject = {}
    if (hybridObjectMap[hybridObjectMapKeyList[0]]) {
        auxiliaryAttributeObject = hybridObjectMap[hybridObjectMapKeyList[0]]['attributeObject']
    }
    hybridObjectMapKeyList.forEach(key => { // key = sample id
        let sampleIdList = hybridObjectMap[key]['sampleIdList']
        exportSampleIdListObject[sampleIdList[0]] = sampleIdList
        //exportSampleIdList.push(sampleIdList[0])
    })
    console.log("Export Excel:", hybridObjectMap)

    let workcenterDoc = await Entity.findOne({_id: workcenterId}).exec()
    if (!workcenterDoc) {
        res.status(400).json('invalid workcenter id: ' + workcenterId)
        return
    }
    let genreDoc = await Genre.findOne({"SYS_ENTITY": workcenterDoc}).exec()
    let attributeDocList = await Attribute.find(
        {"SYS_GENRE": genreDoc._id},
        '',
        {
            sort: {
                SYS_ORDER: 1
            }
        })
    let headers = []
    let fields = []
    let types = []
    let routingHeaders = ["顺序", "实际值", "IDENTIFIER", "建议值", "名称"] // hardcoding
    let routingFields = ["SYS_ORDER", "SYS_DURATION", "id", "SYS_DURATION", "SYS_SOURCE"] // hardcoding
    let routingTypes = ["number", "number", "string", "number", "string"]
    let routingData = []

    // await seems to work fine in the for loop instead of forEach
    for (let attributeDoc of attributeDocList) {

        console.log("< 1.0")
        let attributeObject = JSON.parse(JSON.stringify(attributeDoc))
        //console.log(">>", attributeObject.SYS_TYPE, attributeObject[attributeObject.SYS_LABEL])

        // Export non-entity attributes or refered entities
        // Never export BoM or Routing of which SYS_TYPE_ENTITY_REF is false
        if (attributeObject.SYS_TYPE != 'entity' ||
            attributeObject.SYS_TYPE_ENTITY_REF){ // Not export BoM or Routing
            headers.push(attributeObject[attributeObject['SYS_LABEL']])
            fields.push(attributeObject['SYS_CODE'])
            types.push(attributeObject['SYS_TYPE'])
        } else {
            console.log("< 1")
            // Process BoM or Routing
            let bomObject = attributeObject.SYS_TYPE_ENTITY
            let bomGenreDoc = await Genre.findOne(
                {"SYS_ENTITY": attributeObject.SYS_TYPE_ENTITY}).exec()
            console.log("< 1.3")
            let bomDocList = await Entity.find(
                {"SYS_GENRE": bomGenreDoc._id}).exec()
            console.log("< 1.5")

            for (let bomDoc of bomDocList) {
                let bomObject = JSON.parse(JSON.stringify(bomDoc))
                let sourceDoc = await Entity.findOne({"_id": bomObject['SYS_SOURCE']}).exec()
                let sourceObject = JSON.parse(JSON.stringify(sourceDoc))

                console.log("> source", sourceObject[sourceObject.SYS_LABEL])
                await routingData.push({
                    'SYS_ORDER': bomObject['SYS_ORDER'],
                    'SYS_DURATION': bomObject['SYS_DURATION'],
                    'SYS_SOURCE': sourceObject[sourceObject.SYS_LABEL],
                    'id': bomObject['_id'],
                })
            }
            console.log("< 2")
        }
    }
    console.log("< 3", routingData.length)

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

    let entityDocList = await Entity.find({_id: {$in: Object.keys(exportSampleIdListObject)}}).exec()

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
                //console.log(">>> entityObject._id", entityObject._id)
                //console.log(">>> key", key)
                if (hybridObjectMap[entityObject._id]['attributeObject'] &&
                    hybridObjectMap[entityObject._id]['attributeObject'][key]){
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
    let _data = {}
    if (data.length > 0) {
        _data = data
            .map((v, i) => fields.map((k, j) => Object.assign({}, { v: v[k], position: String.fromCharCode(65+j) + (i+2) })))
            .reduce((prev, next) => prev.concat(next))
            .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
    }
    let output = Object.assign({}, _headers, _data)
    let outputPos = Object.keys(output)
    let ref = outputPos[0] + ':' + outputPos[outputPos.length - 1]

    let bomOutput = {}
    let bomRef = ''
    let _routingData = {}
    if (routingData.length > 0){
        let _routingHeaders = routingHeaders
            .map((v, i) => Object.assign({}, {v: v, position: String.fromCharCode(65+i) + 1 }))
            .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
        _routingData = routingData
            .map((v, i) => routingFields.map((k, j) => Object.assign({}, { v: v[k], position: String.fromCharCode(65+j) + (i+2) })))
            .reduce((prev, next) => prev.concat(next))
            .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
        bomOutput = Object.assign({}, _routingHeaders, _routingData)
        let bomOutputPos = Object.keys(bomOutput)
        bomRef = bomOutputPos[0] + ':' + bomOutputPos[bomOutputPos.length - 1]
    }

    console.log("< 5", _routingData)
    console.log("< 6", routingData)
    //console.log("< 6", bomOutput)
    let wb = {
        SheetNames: ['samples', 'bom'],
        Sheets: {
            'samples': Object.assign({}, output, { '!ref': ref }),
            'bom': Object.assign({}, bomOutput, {'!ref': bomRef}),
        }
    }

    let timestamp = getTimestamp()
    let tempfile = `tempfolder/${timestamp}.${req.body.workcenterId}.xlsx`
    XLSX.writeFile(wb, tempfile)
    res.download(tempfile)

    return
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
