var express=require('express');
var router=express.Router();
var DButilsAzure = require('./../DButils');
module.exports = router;
var util=require('util');
var jwt    = require('jsonwebtoken');

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
function verifyToken(token){
    //var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('secret'), function (err, decoded) {
    if (err) {
    return res.json({ success: false, message: 'Failed to authenticate token.' });
    } else {
    // if everything is good, save to request for use in other routes
    // get the decoded payload and header
    var decoded = jwt.decode(token, {complete: true});
    req.decoded= decoded; // decoded.payload , decoded.header
    next();
    }

}