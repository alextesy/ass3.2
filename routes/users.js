var express=require('express');
var router=express.Router();
var DButilsAzure = require('./../DButils');
module.exports = router;
var util=require('util');
var jwt    = require('jsonwebtoken');
var PriorityQueue=require('js-priority-queue');

var fs = require('fs'),
xml2js = require('xml2js');
var parser = new xml2js.Parser();


router.use('/log',function(req,res,next){
    var token=req.body.token||req.query.token||req.headers['x-access-token'];
    if(token){
        jwt.verify(token,'secret',function(err,decoded){
            if(err){
                return res.status(404).json({success: false, message:'Failed to authenticate token.='});
            }else{
                var decoded=jwt.decode(token, {complete:true});
                req.decoded=decoded;
                next();
            }
        })
    }
    else{
        return res.status(404).json({success: false, message:'Failed to authenticate token.='});
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
        res.status(500).send('Error while getting user details');
    })
})

router.post('/log/POI',function(req,res){
    var username=req.decoded.payload.userName;
    var POI=req.body.poiID;
    var insertPOI = util.format("INSERT INTO userSaved (username,poiID,savedOrder) VALUES ('%s','%s','%s');",username,POI,0);
    DButilsAzure.execQuery(insertPOI)
    .then(function(result){
        res.send("The POI was saved Successfully");
    })
    .catch(function(err){
        res.status(500).send('Error while saving the POI');
    })

})

router.delete('/log/POI',function(req,res){
    var username=req.decoded.payload.userName;
    var POI=req.body.poiID;
    var insertPOI = util.format("DELETE FROM userSaved WHERE username='%s' AND poiID='%s';",username,POI);
    DButilsAzure.execQuery(insertPOI)
    .then(function(result){
        res.send("The POI was deleted Successfully");
    })
    .catch(function(err){
        res.status(500).send('Error while deletting the POI');
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
        res.status(500).send('Error while getting saved POIs');
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
        res.status(500).send('Error while getting last saved');
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
        res.status(500).send('Error while getting number of saved');
    })
})

router.put('/log/savedPOIOrder',function(req,res){
    var username=req.decoded.payload.userName;
    var pois=req.body.pois;
    var arr=[];
    for (var i = 0; i < pois.length; ++i) {
        var updateQuery=util.format("UPDATE userSaved SET savedOrder='%s' WHERE  username='%s' AND poiID='%s';",i,username,pois[i])
        arr.push(DButilsAzure.execQuery(updateQuery));
    }
    Promise.all(arr)
    .then(function(){
        console.log("new order has created");
        res.send("The Order has been updated");
    })
    .catch(function(err){
        console.log(err);
        res.status(500).send('Error while updating order');
    })
})


router.get('/questionslist',function(req,res){
    DButilsAzure.execQuery('SELECT * FROM questions')
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        console.log(err);
        res.status(500).send("Failed to return");
    })
})

router.post('/passwordRetrieval',function(req,res){
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
                res.status(500).send("Failed to retrieve the password");
            })
        }
        else 
            res.send('wrongAnswer');
    })
    .catch(function(err){
        res.status(500).send("Failed to retrieve the password");
    })


    
})




router.post('/register',function(req,res){
    var username=req.body.username;
    var pass=req.body.password;
    var name=req.body.firstname;
    var lastName=req.body.lastname;
    var city=req.body.city;
    var country=req.body.country;
    var email=req.body.email;
    var query=util.format("INSERT INTO users VALUES ('%s','%s','%s','%s','%s','%s','%s');",username,pass,name,lastName,city,country,email);
    var categoriesID=req.body.categories;
    var questions = req.body.questions
    var answers = req.body.answers
    var questionquery = util.format("INSERT INTO userquestions VALUES ('%s','%s','%s'),('%s','%s','%s');",username,questions[0],answers[0],username,questions[1],answers[1]);
//     //enter new user to users tables
    DButilsAzure.execQuery(query)
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        res.status(500).send('Error Inserting in USER');
    })
//    //enter new user categories
    for(var i=0;i<categoriesID.length;i++){
        var catquetyquery = util.format("INSERT INTO UserCategories VALUES ('%s','%s');",username,categoriesID[i]);
        DButilsAzure.execQuery(catquetyquery)
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            res.status(500).send('Error Inserting in Category');
        })
    }
    
    //enter new questions
    DButilsAzure.execQuery(questionquery)
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        res.status(500).send('Error Inserting in questions');
    })
});


router.get('/countries',function(req,res){
    fs.readFile('countries.xml', function(err, data) {
        parser.parseString(data, function (err, result) {
            res.send(result);
            console.log('Done');
        });
    });
})
//--------------

router.post('/login', function(req,res){
    var query=util.format("SELECT username,password FROM users WHERE username='%s';",req.body.username);
    user=DButilsAzure.execQuery(query)
    .then(function(result){
        var user=result[0];
        if(req.body.password==user['password']){
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
        res.status(500).send('Error while logging in');
    })
  
})

router.post('/log/review',function(req,res){
    var username=req.decoded.payload.userName;
    var poiID=req.body.poiID;
    var review=req.body.review;
    var insertPOI = util.format("INSERT INTO poireview (ID,review,username) VALUES ('%s','%s','%s');",poiID,review,username);
    DButilsAzure.execQuery(insertPOI)
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        res.status(500).send('Failed to save the review');
    })
})

router.post('/log/rating',function(req,res){
    var poiID=req.body.poiID;
    var rating=req.body.rating;
    var ratings = util.format("SELECT numOfRaters,sumOfRatings FROM pois WHERE ID='%s';",poiID);
    DButilsAzure.execQuery(ratings)
    .then(function(result){
        var newNumOfRaters=result[0]['numOfRaters']+1;
        var newSum=result[0]['sumOfRatings']+Number(rating);
        var newRating=newSum/newNumOfRaters;
        var newRatings = util.format("UPDATE pois SET numOfRaters='%s',sumOfRatings='%s',rating='%s' WHERE ID='%s';",newNumOfRaters,newSum,newRating,poiID);
        DButilsAzure.execQuery(newRatings)
        .then(function(result){
            res.status(200).send("The Ratings has updated");
        })
        .catch(function(err){
            res.status(500).send('Failed to rate');
        })
    })
    .catch(function(err){
        res.status(500).send('Failed to rate');
    })
})
