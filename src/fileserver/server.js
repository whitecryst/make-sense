var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('<html><body><h1>Hello World!</h1></body></html>');
});


app.get('/nodegraph/test', function (req, res) {
    res.status(200).json({isConnected: true});
});

app.post('/nodegraph/query', function (req, res) {
    //res.send('[{"id": "1","title": "Name xy","sub_title": "Solaranlage","arc__bezug": "0.52","arc__einspeisung": "0.48","detail__anlage": "Gebaut in 1990","stat1": 453.02,"stat2": 231.3,"edges": [{"target_id": "2","stat1": 123,"stat2": 456,"detail__edge": "Aktuelle Bauarbeiten"}]},{"id": "2","title": "Name ab","sub_title": "Netzpunkt","arc__bezug": "0.5","arc__einspeisung": "0.5","detail__anlage": "Letzter Ausfall: 03.02.2018","stat1": 153.02,"stat2": 421.3,"edges": []}]');
    var data;
    var fs = require('fs');
    fs.readFile( __dirname + '/nodegraph.json', function (err, data) {
        if (err) {
            res.status(500).json({error:err});
            throw err; 
        }
        console.log(data.toString());
        res.send(data.toString());
    });
    
});


app.post('/submit-data', function (req, res) {
    res.send('POST Request');
});

app.put('/update-data', function (req, res) {
    res.send('PUT Request');
});

app.delete('/delete-data', function (req, res) {
    res.send('DELETE Request');
});

//setting middleware
app.use('/images', express.static(__dirname + '/Images'));


var server = app.listen(3001);
