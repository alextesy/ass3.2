var express=require('express');
var router=express.Router();
var DButilsAzure = require('./../DButils');
module.exports = router;
var util=require('util');


  //get from DB all POI  -- NEED TO ADD PICTURES AND reviews
router.get('/AllPOIs',function(req,res){
  
        var query= "SELECT * FROM pois"
        DButilsAzure.execQuery(query)
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send('error when try to find')
        })
});
    //get from DB all POi by cat
router.get('/POIbyCategory/:categoryid',function(req,res){

    var query=util.format("SELECT * FROM pois WHERE categoryID='%d';",req.params.categoryid);
    DButilsAzure.execQuery(query)
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        console.log(err);
        res.status(500).send('Error retrieving the categories POIs')

    })
});


    //get from DB all POi by cat 
router.get('/MostpopularPOI/:categoryid/numbers/:n',function(req,res){
   
   get_N_popularPOIinCat(req.params.categoryid,req.params.n).then(function(result){ res.send(result)})
   .catch(function(err){
       res.status(404).send('error when try to find');
   })
   
});

router.get('/allCategories',function(req,res){

    var query=util.format("SELECT * FROM categories" );
    DButilsAzure.execQuery(query)
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        console.log(err);
        res.status(500).send('Error retrieving the categories POIs')

    })
});

//get from DB POI details ,images and reiviews
router.get('/:POIid',function(req,res){
    var query=util.format("SELECT * FROM pois WHERE ID = '%s';",req.params.POIid);
    let arr = {};
    DButilsAzure.execQuery(query)
    .then(function(result){
        arr['poidetails'] = result;
        console.log(arr['poidetails'][0].name);
        return arr;
    })
    .then(function(arr){
       return getpoiimages(arr['poidetails'][0].name).then(function(images){ 
            arr['images'] = images;
            return arr;})
    })
    .then(function(arr){
       return getpoireviews(arr['poidetails'][0].name).then(function(reviews){  
           arr['reviews'] = reviews;
           return arr;})
    })
    .then(function(arr){
        var x = arr['poidetails'][0].ID;
        var q = util.format("UPDATE pois SET numOFViews = numOFViews + 1 WHERE ID = '%s'",x);
        DButilsAzure.execQuery(q)
        res.send(arr);
    })
    .catch(function(err){
        console.log(err);
        res.status(500).send('error when try to find');
    })
});



//get random POI 
router.get('/RandomPOI/:rating/n/:n',function(req,res){

    var query=util.format("SELECT * FROM pois INNER JOIN poimage ON pois.ID=poimage.ID WHERE rating >= '%d';",req.params.rating);
    DButilsAzure.execQuery(query)
    .then(function(result){
        if(req.params.n > result.length)
            res.send(result);
        else{
            ans = [];
            poid =[]
            for(i = 0 ; i < req.params.n;i+=1){
                var t = result.splice(Math.floor(Math.random()*result.length),1)
                while(poid.includes(t[0].ID) & result.length>0){
                    var t = result.splice(Math.floor(Math.random()*result.length),1)
                }
                ans.push(t);
                poid.push(t[0].ID)
            }
            res.send(ans);
        }
    })
    .catch(function(err){
        console.error(err);
        res.status(500).send('error when try to find');
    })


});

//get numbers of views of poi

router.get('/numbersofviews/:POIID',function(req,res){

    var query=util.format("SELECT numOFViews FROM pois WHERE ID='%s';",req.params.POIID);
    DButilsAzure.execQuery(query)
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        console.err(err);
        res.status(500).send('error when try to find');
    })

});


// --- DB functions

function getpoiimages(poinames){
    return new Promise(function(resolve , reject){
        var query=util.format("SELECT name,image FROM pois INNER JOIN poimage ON poimage.ID = pois.ID WHERE name = '%s';",poinames);
        DButilsAzure.execQuery(query)
        .then(function(result){
            resolve(result);
        })
        .catch(function(err){
            reject(err);
        })
    });
}
function getpoireviews(poinames){
    return new Promise(function(resolve , reject){
        var query=util.format("SELECT * FROM pois INNER JOIN poireview ON poireview.ID = pois.ID WHERE name='%s';",poinames);
        DButilsAzure.execQuery(query)
        .then(function(result){
            resolve(result);
        })
        .catch(function(err){
            reject(err);
        })
    });
}


function get_N_popularPOIinCat(category,n){
    return new Promise(function(resolve, reject) {
    var query=util.format("SELECT * FROM pois WHERE categoryID='%d';",category);
    DButilsAzure.execQuery(query)
    .then(function(result){
        result.sort(function(a, b){return b.rating - a.rating});
        if( n >= result.length)
            resolve(result);
        else{
            resolve(result.slice(0,n));
        }
    })
    .catch(function(err){
        reject(err);
    })
    });
}



