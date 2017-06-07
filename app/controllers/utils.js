const Attribute = require('mongoose').model('Attribute')
const Genre = require('mongoose').model('Genre')
const Entity = require('mongoose').model('Entity')

var formidable = require('formidable')
var XLSX = require('xlsx')

exports.excelToJSON = function(req, res, next){
    var form = new formidable.IncomingForm()

    form.parse(req)

    form.on('file', function(name, file){
        console.log(name)
        console.log(file.path)

        var workbook = XLSX.readFile(file.path)
        //var workbook = XLSX.read(file, {type:'binary'})
        var sheet_name_list = workbook.SheetNames
        var jsonObject = []
        sheet_name_list.forEach(function(y) {
            var worksheet = workbook.Sheets[y]
            var headers = {}
            var data = []
            for(z in worksheet) {
                if(z[0] === '!') continue
                //parse out the column, row, and value
                var tt = 0
                for (var i = 0; i < z.length; i++) {
                    if (!isNaN(z[i])) {
                        tt = i
                        break
                    }
                }

                var col = z.substring(0,tt)
                var row = parseInt(z.substring(tt))
                var value = worksheet[z].v
                //console.log(col)
                //console.log(row)
                //console.log(value)

                //store header names
                if(row == 2 && value) {
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
            Attribute.find(
                {'SYS_GENRE': entity.SYS_GENRE},
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
                            XLSX.writeFile(wb, `sampleList-${req.query.workcenter}.xlsx`)
                            //res.setHeader('Content-Type', "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                            //res.setHeader("Content-Disposition", "attachment; filename=deployment-definitions.xlsx");
                            res.download(`sampleList-${req.query.workcenter}.xlsx`)
                        }
                    )


                }
            )
        }
    )

}
