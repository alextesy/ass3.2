//this is only an example, handling everything is yours responsibilty !

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
var DButilsAzure = require('./DButils');
var jwt  = require('jsonwebtoken');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//complete your code here


var port = 3000;
app.listen(port, function () {
    console.log('alex ' + port);
});



// models
var users=require('./routes/users');
app.use('/users',users);
var POI = require('./routes/POI')
app.use('/POI',POI)




//-----------------------------------------------------------------------------------------------------


