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


var fs = require('fs'),
xml2js = require('xml2js');
 
var parser = new xml2js.Parser();

var users=require('./routes/users');
app.use('/users',users);

router.post('/login', function(req,res){
    var query=util.format("SELECT username,password FROM users WHERE username='%s';",req.body.username);
    user=DButilsAzure.execQuery(query)
    .then(function(result){
        var user=result[0];
        if(req.body.pass==user['password']){
            var payload = {
                userName: user.username,
            }
            var token = jwt.sign(payload, 'secret', {
                expiresIn: "1d" // expires in 24 hours
            });
                // return the information including token as JSON
            res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
            });    
        }
        else{
            res.send('wrong pass');
        }
    })
    .catch(function(err){
        console.log(err.message);
    })
  
    //if(user[])
})














app.get('/getAllPOIs',function(req,res){
//get from DB all POI
    Poi={'id':123,
        'POIname':'Statue of Liberty',
        'caregoty':'Attraction',
        'rating':4,
        'description':'Very Nice',
        'pictures':['https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/2016-11_Statue_of_Liberty_02.jpg/220px-2016-11_Statue_of_Liberty_02.jpg'],
        'numOfViews':23,
        'reviews':"asd"
    };
    POIs=[Poi];
    res.send(POIs);
})



app.get('/countries',function(req,res){
    fs.readFile('countries.xml', function(err, data) {
        parser.parseString(data, function (err, result) {
            res.send(result);
            console.log('Done');
        });
    });
})
//-------------------------------------------------------------------------------------------------------------------


