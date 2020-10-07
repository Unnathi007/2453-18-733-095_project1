const express=require('express');
const app=express();
//const JsonWebToken=require('jsonwebtoken');
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
//mongodb
const MongoClient=require('mongodb').MongoClient;
//connecting server file
let server=require('./server');
let config=require('./config');
let middleware=require('./middleware');
const response=require('express');
const url='mongodb://127.0.0.1:27017';
const dbName='test';
let db
MongoClient.connect(url, (err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
});
//fetching hospital details
app.get('/hospitaldetails',middleware.checkToken,function (req,res){
    console.log("fetching data from hospital collection");
    var data=db.collection('Hospital').find().toArray()
    .then(result=> res.json(result));
});
 

//ventilator details
app.get('/-',middleware.checkToken,function (req,res){
    console.log("ventilator details");
    var ventilatordetails = db.collection('ventilator').find().toArray()
    .then(result=> res.json(result));
});

app.post('/searchventbystatus',middleware.checkToken,(req,res)=>{
    var status=req.body.status;
    console.log(status);
    var ventilatordetails=db.collection('ventilator').find({"status":status}).toArray().then(result=>res.json(result));
});
//search ventilators by name
app.post('/searchventbyname',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var ventilatordetails=db.collection('ventilator').find({"name":new RegExp(name,'i')}).toArray().then(result=>res.json(result));
});
//update
app.put('/updateventilator',middleware.checkToken,(req,res)=>{
    var ventid={ventilatorId:req.body.ventilatorId};
    console.log(ventid);
    var newvalues={$set:{status:req.body.status}};
    db.collection("ventilator").updateOne(ventid,newvalues,function(err,res){
        res.json('1 document updated');
        if (err) throw err;    
    });
});
app.post('/addventilator',middleware.checkToken,(req,res)=>{
    var hId=req.body.hId;
    var ventilatorId=req.body.ventilatorId;
    var status=req.body.status;
    var name=req.body.name;
    var item={
        hId:hId, ventilatorId:ventilatorId,status:status,name:name
    };
    db.collection('ventilator').insertOne(item,function(err,result){
         res.json('Item inserted');
    })
});
//search hospital
app.post('/searchhospital',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var hospitaldetails=db.collection('Hospital').find({'name':new RegExp(name,'i')}).toArray().then(result=>res.json(result));
});
app.delete('/delete',middleware.checkToken,(req,res)=>{
    var myquery=req.query.ventilatorId;
    console.log(myquery);
    var myquery1={ventilatorId:myquery};
    db.collection('ventilator').deleteOne(myquery1,function(err,obj)
        {
            if(err) throw err;
            res.json("1 document deleted");
        }
    )
}).listen(3000);