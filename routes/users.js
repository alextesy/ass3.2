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
    var query=util.format("INSERT INTO users VALUES ('%s','%s','%s','%s','%s','%s','%s');",username,pass,name,lastName,city,country,email);
    var categories=req.body.categories;
    var catquetyquery = util.format("INSERT INTO UserCategories VALUES ('%s','%s'),('%s','%s');",username,categories[0],username,categories[1]);
    //enter new user to users tables
    DButilsAzure.execQuery(query)
    .then(function(result){
        res.send(result)
    })
    .catch(function(err){
        console.err(err)
    })
   //enter new user categories
    DButilsAzure.execQuery(catquetyquery)
    .then(function(result){
        res.send(result)
    })
    .catch(function(err){
        console.err(err)
    })
});