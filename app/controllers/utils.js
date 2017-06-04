
var formidable = require('formidable')
var XLSX = require('xlsx');

exports.excelToJSON = function(req, res, next){
    var form = new formidable.IncomingForm()

    form.parse(req)

    form.on('file', function(name, file){
        console.log(name)
        console.log(file.path)

        var workbook = XLSX.readFile(file.path)
        //var workbook = XLSX.read(file, {type:'binary'})
        var sheet_name_list = workbook.SheetNames;
        var jsonObject = []
        sheet_name_list.forEach(function(y) {
            var worksheet = workbook.Sheets[y];
            var headers = {};
            var data = [];
            for(z in worksheet) {
                if(z[0] === '!') continue;
                //parse out the column, row, and value
                var tt = 0;
                for (var i = 0; i < z.length; i++) {
                    if (!isNaN(z[i])) {
                        tt = i;
                        break;
                    }
                };

                var col = z.substring(0,tt);
                var row = parseInt(z.substring(tt));
                var value = worksheet[z].v;
                //console.log(col)
                //console.log(row)
                //console.log(value)

                //store header names
                if(row == 2 && value) {
                    headers[col] = value;
                    continue;
                }

                if(!data[row]) data[row]={};
                data[row][headers[col]] = value;
            }
            //drop those first two rows which are empty
            data.shift();
            data.shift();
            jsonObject.push(data)
        });
        res.status(200).json(jsonObject)

    })
    //var form = new formidable.IncomingForm();

    //form.parse(req);

    //form.on('fileBegin', function (name, file){
    //file.path = '/home/yang/nodejs/igenetech/lims-backend/uploads/' + file.name;
    //});

    //form.on('file', function (name, file){
    //console.log('Uploaded ' + file.name);
    //});

    ////res.sendFile(__dirname + '/index.html');
    //res.status(200).json("uploaded")
}

exports.JSONToExcel = function(req, res, next){
    res.status(200).json("json to excel")
}
