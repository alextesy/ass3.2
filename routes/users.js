var express=require('express');
var router=express.Router();
var DButilsAzure = require('./../DButils');
module.exports = router;
var util=require('util');

router.post('/register',function(req,res){
    var username=req.body.username;
    var pass=req.body.pass;
    var name=req.body.name;
    var lastName=req.body.lastName;
    var city=req.body.city;
    var country=req.body.country;
    var email=req.body.email;
    var query=util.format("INSERT users VALUES ('%s','%s','%s','%s','%s','%s','%s')",username,pass,name,lastName,city,country,email);
    var categories=req.body.categories;
    DButilsAzure.execQuery(query)
    .then(function(result){
        res.send(result)
    })
    .catch(function(err){
        console.err(err)
    })
});