var express=require('express');
var router=express.Router();
var DButilsAzure = require('./../DButils');
module.exports = router;
var util=require('util');
var jwt    = require('jsonwebtoken');
var PriorityQueue=require('js-priority-queue');


router.use('/log',function(req,res,next){
    var token=req.body.token||req.query.token||req.headers['x-access-token'];
    if(token){
        jwt.verify(token,'secret',function(err,decoded){
            if(err){
                return res.json({success: false, message:'Failed to authenticate token.='});
            }else{
                var decoded=jwt.decode(token, {complete:true});
                req.decoded=decoded;
                next();
            }
        })
    }
});

router.post('/log',function(req,res){
    var username=req.decoded.payload.userName;
    var userQuery=util.format("SELECT * FROM users WHERE username='%s';",username);
    var user=DButilsAzure.execQuery(userQuery)
    .then(function(result){
        var user={
            username:username,
            FirstName:result[0]['name'],
            LastName:result[0]['lastname'],
            City:result[0]['city'],
            Country:result[0]['country'],
            Email:result[0]['email'],
        }
        var categoryQuery=util.format("SELECT categoryID FROM UserCategories WHERE username='%s';",username);
        var cat=DButilsAzure.execQuery(categoryQuery)
        .then(function(result){
            categories=[]
            for(var i=0;i<result.length;i++){
                categories.push(result[i]['categoryID']);
            }
            user.categories=categories;
            res.send(user);
        })
 


        

    })
 
    .catch(function(err){
        console.err(err);
    })
})

router.post('/log/POI',function(req,res){
    var username=req.decoded.payload.userName;
    var POI=req.body.poiID;
    var insertPOI = util.format("INSERT INTO userSaved (username,poiID) VALUES ('%s','%s');",username,POI);
    DButilsAzure.execQuery(insertPOI)
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        console.log(err);
    })

})

router.delete('/log/POI',function(req,res){
    var username=req.decoded.payload.userName;
    var POI=req.body.poiID;
    var insertPOI = util.format("DELETE FROM userSaved WHERE username='%s' AND poiID='%s';",username,POI);
    DButilsAzure.execQuery(insertPOI)
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        console.log(err);
    })

})

router.get('/log/saved',function(req,res){
    var username=req.decoded.payload.userName;
    var query=util.format("SELECT poiID, name FROM userSaved INNER JOIN pois ON userSaved.poiID = pois.ID WHERE userSaved.username = '%s';",username)
    DButilsAzure.execQuery(query)
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        console.log(err);
    })

})

router.get('/log/2LastSaved',function(req,res){
    var username=req.decoded.payload.userName;
    var query=util.format("SELECT poiID, name, counter FROM userSaved INNER JOIN pois ON userSaved.poiID = pois.ID WHERE userSaved.username = '%s';",username)
    DButilsAzure.execQuery(query)
    .then(function(result){
        var queue = new PriorityQueue({ comparator: function(a, b) { return b.counter - a.counter; }});
        for(var i=0;i<result.length;i++){
            queue.queue(result[i])
        }
        returnArr =[];
        returnArr.push(queue.dequeue());	
        returnArr.push(queue.dequeue());	


        res.send(returnArr);
    })
    .catch(function(err){
        console.log(err);
    })

})

router.get('/log/numberOfSaved',function(req,res){
    var username=req.decoded.payload.userName;
    var query=util.format("SELECT COUNT(*) as numOfSaved FROM userSaved WHERE userSaved.username = '%s';",username)
    DButilsAzure.execQuery(query)
    .then(function(result){
        res.send(result[0]);
    })
    .catch(function(err){
        console.log(err);
    })
})

router.put('/log/savedPOIOrder',function(req,res){
    var username=req.decoded.payload.userName;
    var pois=req.body.pois;
    var files = [];
    for (var i = 0; i < pois.length; ++i) {
        var delQuery=util.format("DELETE FROM userSaved WHERE username='%s' AND poiID='%s';",username,pois[i]);
        files.push(DButilsAzure.execQuery(delQuery));
    }
    Promise.all(files).then(function() {
        console.log("all saved deleted");
    }).then(function(result){
        var arr=[];
        for (var i = 0; i < pois.length; ++i) {
            var insertQuery=util.format("INSERT INTO userSaved(username,poiID) VALUES ('%s','%s');",username,pois[i])
            arr.push(DButilsAzure.execQuery(insertQuery));
        }
        Promise.all(arr).then(function(){
            console.log("new order has created");

        })
    })
    
    
    .catch(function(err){
        console.log(err);
    })
})








router.post('/passwordRetrival',function(req,res){
    var questionQuery=util.format("SELECT answer FROM userquestions WHERE username='%s' AND (ID='%d' OR ID='%d');",req.body.username,req.body.questionID[0],req.body.questionID[1]);
    DButilsAzure.execQuery(questionQuery)
    .then(function(result){
        if(result[0]['answer']==req.body.answer[0]&&result[1]['answer']==req.body.answer[1]){
            var userQuery=util.format("SELECT password FROM users WHERE username='%s';",req.body.username);
            DButilsAzure.execQuery(userQuery)
            .then(function(result){
                res.send(result[0]['password']);
            })
            .catch(function(err){
                console.err(err);
            })
        }
        else 
            res.send('wrongAnswer');
    })
    .catch(function(err){
        console.err(err);
    })


    
})




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
    var questions = req.body.questions
    var answers = req.body.answers
    var questionquery = util.format("INSERT INTO userquestions VALUES ('%s','%s','%s'),('%s','%s','%s');",username,questions[0],answers[0],username,questions[1],answers[1]);
//     //enter new user to users tables
    DButilsAzure.execQuery(query)
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        console.err(err);
    })
//    //enter new user categories
    for(var i=0;i<categories.length;i++){
        var catquetyquery = util.format("INSERT INTO UserCategories VALUES ('%s','%s');",username,categories[i]);
        DButilsAzure.execQuery(catquetyquery)
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.err(err);
        })
    }
    
    //enter new questions
    DButilsAzure.execQuery(questionquery)
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        console.err(err);
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

