const Attribute = require('mongoose').model('Attribute')
const Genre = require('mongoose').model('Genre')
const Entity = require('mongoose').model('Entity')

const formidable = require('formidable')
const XLSX = require('xlsx')

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
        sheet_name_list.forEach(function(y) {
            let worksheet = workbook.Sheets[y]
            let headers = {}
            let data = []
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
                //console.log(col)
                //console.log(row)
                //console.log(value)

                //store header names
                if(row == 1 && value) {
                    headers[col] = value
                    continue
                }

                if(!data[row]) data[row]={}
                data[row][headers[col]] = value
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
    if (!req.query.ids){
        res.status(400).json('invalid arguments')
        return
    }

    let ids = req.query.ids.split(',')

    let entity = Entity.findOne(
        {_id: ids[0]},
        (err, entity) => {
            if (!entity){
                console.log(entity)
                res.status(400).json('invalid id')
                return
            }

            Entity.findOne(
                {_id: req.query.workcenter},
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
                                        attributes.forEach(attribute => {
                                            let attr = JSON.parse(JSON.stringify(attribute))
                                            headers.push(attr[attr['SYS_LABEL']])
                                            fields.push(attr['SYS_CODE'])
                                        })
                                        headers.push('IDENTIFIER')
                                        fields.push('id')

                                        let data = []
                                        Entity.find(
                                            {_id: {$in: ids}},
                                            (err, entities) => {
                                                entities.forEach(entity => {
                                                    let e = JSON.parse(JSON.stringify(entity))
                                                    let object = {}
                                                    fields.forEach(key => {
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
                                                    SheetNames: ['mySheet'],
                                                    Sheets: {
                                                        'mySheet': Object.assign({}, output, { '!ref': ref })
                                                    }
                                                }

                                                let timestamp = getTimestamp()
                                                let tempfile = `tempfolder/${timestamp}.${req.query.workcenter}.xlsx`
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

                        res.status(400).json('invalid workcenter id: '+req.query.workcenter)
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
