const path = require('path')
const config = require(path.join(__dirname, '../../config/config.js'))
const Attribute = require('mongoose').model('Attribute')
const Genre = require('mongoose').model('Genre')
const Entity = require('mongoose').model('Entity')

const formidable = require('formidable')
const XLSX = require('xlsx')

const Utils = require('../utils/controller')
const async = require('async')

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

exports.excelExport = async function(req, res, next){

    req.query['SYS_ENTITY_TYPE'] = 'collection'
    req.query['SYS_IDENTIFIER'] = new RegExp("^/PROJECT_MANAGEMENT/GENERAL_PROJECT" )

    let query = Utils.list(req, Entity)

    let sampleList = await query.exec()
    //console.log(sampleList.length, sampleList[0])
    let productWorkcenterList = await Entity.find({
        'SYS_IDENTIFIER': { $regex: '^/PRODUCT_WORKCENTER' },
        'SYS_ENTITY_TYPE': 'class',
    })
    //console.log(productWorkcenterList.length, productWorkcenterList[0])
    let projectWorkcenterDoc = await Entity.findOne({
        'SYS_IDENTIFIER': { $regex: '^/PROJECT_MANAGEMENT' },
        'SYS_ENTITY_TYPE': 'class',
    })
    let projectWorkcenter = projectWorkcenterDoc.toObject()
    //console.log(projectWorkcenter)

    let productWorkcenterListWithOrder = await Entity.find(
        {
            'SYS_IDENTIFIER': {
                $regex: '^/ROUTING/PRODUCT_ROUTING/STANDARD_PRODUCT_ROUTING'
            },
            'SYS_ENTITY_TYPE': 'object',
        })
    .sort({SYS_ORDER: 1})
    //console.log(productWorkcenterListWithOrder.length, productWorkcenterListWithOrder[0])
    let workcenterList = []
    workcenterList.push(projectWorkcenter)
    for (let workcenter of productWorkcenterListWithOrder) {
        let workcenterObject = workcenter.toObject()
        for (w of productWorkcenterList) {
                if (w.id == workcenterObject.SYS_SOURCE){
                    workcenterList.push(w.toObject())
                }
        }
    }
    //console.log(workcenterList[1])
    // TODO: append the difference between two arrays

    let columnList = []
    for (let workcenter of workcenterList){
        let column = {}
        column['workcenter'] = workcenter
        column['attributes'] = []

        let genreList = await Genre.find({
            'SYS_ENTITY': workcenter.id
        })
        for (let genre of genreList){
            let attributeList = await Attribute.find({
                'SYS_GENRE': genre.id,
                $or: [
                    {
                        'SYS_TYPE': { $ne: 'entity' }
                    },
                    {
                        $and: [ // keep workcenter but bom/routing
                            {
                                'SYS_TYPE': 'entity' 
                            },
                            {
                                'SYS_TYPE_ENTITY_REF': true,
                            },
                        ]
                    },
                ]
            })
            .sort({'SYS_ORDER': 1})
            attributeList.forEach(attr => {
                column['attributes'].push(attr.toObject())
            })
        }
        columnList.push(column)
    }
    //console.log(columnList[0]['workcenter'], columnList[0]['attributes'].length)
    //console.log(columnList.length, columnList[1])

    let workcenterHeaders = []
    let attributeHeaders = []
    let merges = []
    //for (let column of columnList){
    let prevLength = 0
    for (let i = 0; i < columnList.length; i++){
        column = columnList[i]
        let workcenter = column['workcenter']
        let attributes = column['attributes']

        workcenterHeaders.push(
            Object.assign(
                {},
                {
                    t: 's',
                    v: workcenter[workcenter['SYS_LABEL']],
                    position: numToAlpha(prevLength) + 1,
                }
            )
        )
        merges.push(
            {
                s: {
                    r: 0,
                    c: prevLength,
                },
                e: {
                    r: 0,
                    c: prevLength + attributes.length - 1,
                }
            }
        )

        for (let i = 0; i < attributes.length; i++) {
            let attr = attributes[i]
            attributeHeaders.push({
                v: attr[attr['SYS_LABEL']],
                position: numToAlpha(prevLength + i) + 2,
            })
        }

        prevLength += attributes.length
    }
    //console.log(attributeHeaders)

    //let headers = attributeHeaders
    let _workcenterHeaders = workcenterHeaders
        //.map((v, i) => Object.assign({}, {v: v, position: numToAlpha(i) + 1 }))
        .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
    let _attributeHeaders = attributeHeaders
        .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})


    let sampleMap = {}
    for (let sampleDoc of sampleList){
        let sample = sampleDoc.toObject()
        sampleMap[sample['SYS_SAMPLE_CODE']] = await Entity.find({
            'SYS_SAMPLE_CODE': sample['SYS_SAMPLE_CODE'],
            'SYS_DATE_COMPLETED': {$ne: ''},
        })
    }
    //console.log(sampleMap)

    let data = []
    for (let i = 0; i < sampleList.length; i++) {
        let sample = sampleList[i].toObject()
        let prevLength = 0

        // traverse attributes for each submitted samples in requset

        for (let column of columnList){
            let attributeList = column['attributes']
            for (let j = 0; j < attributeList.length; j ++){
                let attribute = attributeList[j]

                let latest = new Date(1993)
                let value = ''

                // get the latest value of attributes by the same sample code

                for (let item of sampleMap[sample['SYS_SAMPLE_CODE']]){
                    let s = item.toObject()
                    let v = s[attribute['SYS_CODE']]
                    let d = new Date(s['SYS_DATE_COMPLETED'])
                    if (s.hasOwnProperty(attribute['SYS_CODE'])) {
                        if (d > latest) {
                            latest = new Date(s['SYS_DATE_COMPLETED'])
                            //console.log(">>> ",attribute['SYS_CODE'], v, ' > ', value)
                            value = v
                        }
                    }
                }
                data.push(
                    Object.assign(
                        {},
                        {
                            //v: sample[attribute['SYS_CODE']],
                            v: value,
                            position: numToAlpha(prevLength + j) + (i + 3)
                        }
                    )
                )
            }
            prevLength += column['attributes'].length
        }
    }
    let _data = data
        .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
    //console.log(_data)

    let output = Object.assign({}, _workcenterHeaders, _attributeHeaders, _data)
    let outputPos = Object.keys(output)
    let ref = outputPos[0] + ':' + outputPos[outputPos.length - 1]

    //console.log(ref, merges, _workcenterHeaders, _attributeHeaders)
    let wb = {
        SheetNames: ['????????????'],
        Sheets: {
            '????????????': Object.assign({}, output, {'!ref': ref}, {'!merges': merges}),
        }
    }
    //console.log(ref, output)
    let timestamp = getTimestamp()
    //let tempfile = `tempfolder/${timestamp}.xlsx`
    let tempfile = `tempfolder/test.xlsx`
    XLSX.writeFile(wb, tempfile)
    res.download(tempfile)
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
                // the IDENTIFIER must be included.
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
                    //console.log("V", value, col, auxiliaryCol)
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
    let workcenterId = req.body['workcenterId']
    let hybridObjectMap = req.body['hybridObjectMap']
    let attributeList = req.body['attributeList']
    if (!attributeList) {
        res.status(400).json('invalid attribute list')
        return
    }

    let exportSampleIdListObject = {} // only one sample for each hybrid sample
    let hybridObjectMapKeyList = Object.keys(hybridObjectMap)
    let auxiliaryAttributeObject = {}
    if (hybridObjectMap[hybridObjectMapKeyList[0]]) {
        auxiliaryAttributeObject = hybridObjectMap[hybridObjectMapKeyList[0]]['attributeObject']
    }
    hybridObjectMapKeyList.forEach(key => { // key = sample id
        let sampleIdList = hybridObjectMap[key]['sampleIdList']
        exportSampleIdListObject[sampleIdList[0]] = sampleIdList
    })

    let workcenterDoc = await Entity.findOne({_id: workcenterId}).exec()
    if (!workcenterDoc) {
        res.status(400).json('invalid workcenter id: ' + workcenterId)
        return
    }

    let headers = []
    let fields = []
    let types = []

    let sheets = {
        "sheet1": {
        },
    }
    let groupKey = ""
    let sheet2Name = ""
    // await seems to work fine in the for loop instead of forEach
    for (let attribute of attributeList) {
        // Export non-entity attributes or refered entities
        // Never export BoM or Routing of which SYS_TYPE_ENTITY_REF is false
        if (attribute.SYS_TYPE != 'entity' ||
            attribute.SYS_TYPE_ENTITY_REF){ // Not export BoM or Routing
            headers.push(attribute[attribute['SYS_LABEL']])
            fields.push(attribute['SYS_CODE'])
            types.push(attribute['SYS_TYPE'])
        }
    }

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

    entityDocList.filter(entityDoc => {
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
                    result[key] = exportSampleIdListObject[entityObject[key]]
                } else {
                    result[key] = entityObject[key]?entityObject[key]:''
                }
            } else {
                if (hybridObjectMap[entityObject._id]['attributeObject'] &&
                    hybridObjectMap[entityObject._id]['attributeObject'][key]){
                    result[key] = hybridObjectMap[entityObject._id]['attributeObject'][key]['value']
                }

            }
        })
        data.push(result)
    })


    let _headers = headers
        .map((v, i) => Object.assign({}, {v: v, position: numToAlpha(i) + 1 }))
        .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
    let _data = {}
    if (data.length > 0) {
        _data = data
            .sort((a,b) => {
                if (a.SYS_SAMPLE_CODE > b.SYS_SAMPLE_CODE) {
                    return 1
                } else {
                    return -1
                }
            })
            .map((v, i) => fields.map((k, j) => Object.assign({}, { v: v[k], position: '' + numToAlpha(j) + (i+2) })))
            .reduce((prev, next) => prev.concat(next))
            .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
    }
    let output = Object.assign({}, _headers, _data)
    let outputPos = Object.keys(output)
    let ref = outputPos[0] + ':' + outputPos[outputPos.length - 1]

    let wb = {
        SheetNames: ['????????????', sheet2Name],
        Sheets: {
            '????????????': Object.assign({}, output, { '!ref': ref }),
        }
    }

    let timestamp = getTimestamp()
    let tempfile = `tempfolder/${timestamp}.${req.body.workcenterId}.xlsx`
    XLSX.writeFile(wb, tempfile)
    res.download(tempfile)

    return
}

exports.JSONToExcel2 = async function(req, res, next){
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
    //console.log("Export Excel:", hybridObjectMap)

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

    let sheets = {
        "sheet1": {
        },
        "sheet2": {
            "bom": {
                //"headers":["????????????", "??????", "IDENTIFIER", "????????????", "????????????"],
                "headers": [],
                "fields": ["SYS_QUANTITY", "REMARK", "id", "SYS_QUANTITY", "SYS_SOURCE"],
                "types": ["number", "string", "string", "number", "string"],
                "data": [],
            },
            "routing": {
                //"headers": ["??????", "????????????", "IDENTIFIER", "????????????", "Workcenter??????"],
                "headers": [],
                "fields": ["SYS_ORDER", "SYS_DURATION", "id", "SYS_DURATION", "SYS_SOURCE"],
                "types": ["number", "number", "string", "number", "string"],
                "data": [],
            },
        }
    }
    let groupKey = ""
    let sheet2Name = ""
    // await seems to work fine in the for loop instead of forEach
    for (let attributeDoc of attributeDocList) {

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
            // Process BoM or Routing
            let groupGenreDoc = await Genre.findOne(
                {"SYS_ENTITY": attributeObject.SYS_TYPE_ENTITY}).exec()
            let groupAttrList = await Attribute.find(
                {"SYS_GENRE": groupGenreDoc._id})
            let groupDocList = await Entity
                .find({"SYS_GENRE": groupGenreDoc._id})
                .sort('SYS_ORDER')
                .exec()

            let aGroup = JSON.parse(JSON.stringify(groupDocList[0]))
            if (aGroup.hasOwnProperty('SYS_ORDER') || aGroup.hasOwnProperty('SYS_DURATION')) {
                groupKey = "routing"
                sheet2Name = "????????????"

                let orderAttrDoc = groupAttrList
                    .filter(attr => attr.SYS_CODE == 'SYS_ORDER')[0]
                let orderAttrObj = JSON.parse(JSON.stringify(orderAttrDoc))
                let orderHeader = orderAttrObj[orderAttrObj['SYS_LABEL']]

                let durationAttrDoc = groupAttrList
                    .filter(attr => attr.SYS_CODE == 'SYS_DURATION')[0]
                let durationAttrObj = JSON.parse(JSON.stringify(durationAttrDoc))
                let durationHeader = durationAttrObj[durationAttrObj['SYS_LABEL']]

                let sourceAttrDoc = groupAttrList
                    .filter(attr => attr.SYS_CODE == 'SYS_SOURCE')[0]
                let sourceAttrObj = JSON.parse(JSON.stringify(sourceAttrDoc))
                let sourceHeader = sourceAttrObj[sourceAttrObj['SYS_LABEL']]

                console.log(orderHeader)
                sheets['sheet2'][groupKey]['headers'].push(orderHeader)
                sheets['sheet2'][groupKey]['headers'].push(durationHeader)
                sheets['sheet2'][groupKey]['headers'].push('IDENTIFIER')
                sheets['sheet2'][groupKey]['headers'].push(orderHeader)
                sheets['sheet2'][groupKey]['headers'].push(sourceHeader)

                console.log(">>> routing")
            } else if (aGroup.hasOwnProperty('SYS_QUANTITY') || aGroup.hasOwnProperty('REMARK')) {
                groupKey = "bom"
                sheet2Name = "????????????"

                let quantityAttrDoc = groupAttrList
                    .filter(attr => attr.SYS_CODE == 'SYS_QUANTITY')[0]
                let quantityAttrObj = JSON.parse(JSON.stringify(quantityAttrDoc))
                let quantityHeader = quantityAttrObj[quantityAttrObj['SYS_LABEL']]

                let remarkAttrDoc = groupAttrList
                    .filter(attr => attr.SYS_CODE == 'REMARK')[0]
                let remarkAttrObj = JSON.parse(JSON.stringify(remarkAttrDoc))
                let remarkHeader = remarkAttrObj[remarkAttrObj['SYS_LABEL']]

                let sourceAttrDoc = groupAttrList
                    .filter(attr => attr.SYS_CODE == 'SYS_SOURCE')[0]
                let sourceAttrObj = JSON.parse(JSON.stringify(sourceAttrDoc))
                let sourceHeader = sourceAttrObj[sourceAttrObj['SYS_LABEL']]

                sheets['sheet2'][groupKey]['headers'].push(quantityHeader)
                sheets['sheet2'][groupKey]['headers'].push(remarkHeader)
                sheets['sheet2'][groupKey]['headers'].push('IDENTIFIER')
                sheets['sheet2'][groupKey]['headers'].push(quantityHeader)
                sheets['sheet2'][groupKey]['headers'].push(sourceHeader)

                console.log(">>> bom")
            }

            for (let groupDoc of groupDocList) {
                let groupObject = JSON.parse(JSON.stringify(groupDoc))
                let sourceDoc = await Entity.findOne({"_id": groupObject['SYS_SOURCE']}).exec()
                let sourceObject = JSON.parse(JSON.stringify(sourceDoc))

                //console.log("> source", sourceObject[sourceObject.SYS_LABEL])

                // groupId is used to identify the group item itself
                // SYS_SOURCE is used to identify the source object to create.
                if (groupKey == "routing"){
                    await sheets['sheet2'][groupKey]['data'].push({
                        'SYS_ORDER': groupObject['SYS_ORDER'],
                        'SYS_DURATION': groupObject['SYS_DURATION'],
                        'SYS_SOURCE': sourceObject[sourceObject.SYS_LABEL],
                        //'id': sourceObject._id,
                        'id': groupObject['_id'],
                    })
                } else if (groupKey = "bom") {
                    await sheets['sheet2'][groupKey]['data'].push({
                        'SYS_QUANTITY': groupObject['SYS_QUANTITY'],
                        'REMARK': groupObject['REMARK'],
                        'SYS_SOURCE': sourceObject[sourceObject.SYS_LABEL],
                        'id': groupObject['_id'],
                    })
                }
            }
        }
    }
    //console.log("data length", sheets['sheet2'][groupKey]['data'].length)

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
        .map((v, i) => Object.assign({}, {v: v, position: numToAlpha(i) + 1 }))
        .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
    let _data = {}
    if (data.length > 0) {
        _data = data
            .sort((a,b) => {
                if (a.SYS_SAMPLE_CODE > b.SYS_SAMPLE_CODE) {
                    return 1
                } else {
                    return -1
                }
            })
            .map((v, i) => fields.map((k, j) => Object.assign({}, { v: v[k], position: '' + numToAlpha(j) + (i+2) })))
            .reduce((prev, next) => prev.concat(next))
            .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
    }
    let output = Object.assign({}, _headers, _data)
    let outputPos = Object.keys(output)
    let ref = outputPos[0] + ':' + outputPos[outputPos.length - 1]

    let groupOutput = {}
    let groupRef = ''
    let _groupData = {}
    if (groupKey != '' && // groupKey is empty for the workcenter without BoM
        sheets['sheet2'][groupKey]['data'].length > 0){
        let _groupHeaders = sheets['sheet2'][groupKey]['headers']
            .map((v, i) => Object.assign({}, {v: v, position: numToAlpha(i) + 1 }))
            .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
        _groupData = sheets['sheet2'][groupKey]['data']
            .map((v, i) => sheets['sheet2'][groupKey]['fields'].map((k, j) => Object.assign({}, { v: v[k], position: numToAlpha(j) + (i+2) })))
            .reduce((prev, next) => prev.concat(next))
            .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})
        groupOutput = Object.assign({}, _groupHeaders, _groupData)
        let groupOutputPos = Object.keys(groupOutput)
        groupRef = groupOutputPos[0] + ':' + groupOutputPos[groupOutputPos.length - 1]
    }

    let wb = {
        SheetNames: ['????????????', sheet2Name],
        Sheets: {
            '????????????': Object.assign({}, output, { '!ref': ref }),
        }
    }
    wb['Sheets'][sheet2Name] = Object.assign({}, groupOutput, {'!ref': groupRef})

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

function numToAlpha(num) {

  var alpha = '';

  for (; num >= 0; num = parseInt(num / 26, 10) - 1) {
    alpha = String.fromCharCode(num % 26 + 0x41) + alpha;
  }

  return alpha;
}

function alphaToNum(alpha) {

  var i = 0,
      num = 0,
      len = alpha.length;

  for (; i < len; i++) {
    num = num * 26 + alpha.charCodeAt(i) - 0x40;
  }

  return num - 1;
}
