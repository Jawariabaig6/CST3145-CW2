const express = require("express");
const path = require('path');
const fs = require('fs');
const app = express();

// requiring cors library
const cors = require('cors');

app.use(express.json());
app.set("port", 3000);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});
//using cors library 
app.use(cors());

const MongoClient = require("mongodb").MongoClient;
let db;
MongoClient.connect("mongodb+srv://JawairiaBaig:jawairiamongo@cluster0.wwyyyvx.mongodb.net",
  (err, client) => {
    db = client.db("petdecode");
  }
);

app.use(function (req, res, next) {
  console.log("Request IP: " + req.url);
  console.log("Request Date: " + new Date());
  next();
});

app.get("/", (req, res, next) => {
  res.send("Select a collection, e.g, /collection/massages");
});

app.param('collectionName',(req,res,next,collectionName)=>{
    req.collection = db.collection(collectionName);
    return next();
})

// get route is working
app.get('/collection/:collectionName',(req,res,next)=>{
    req.collection.find({}).toArray((e,results)=>{
        if(e) return next(e)
        res.send(results);
    })
})
//POST ROUTE 
app.post('/collection/:collectionName',(req,res,next)=>{
    req.collection.insertOne(req.body,(e,results)=>{
        if(e) return next(e)
        res.send(results);
    })
})

const ObjectID = require ('mongodb').ObjectId;
app.get('/collection/:collectionName/:id',(req,res,next)=>{
    req.collection.findOne({_id :new ObjectID(req.params.id)},(e, result)=>{
        if(e) return next(e)
        res.send(result)
    })
})

//UPDATE/PUT 
app.put ('/collection/:collectionName/:id',(req,res,next)=>{
    req.collection.updateOne(
       { _id: new ObjectID (req.params.id)},
       {$set: req.body},
       {safe: true, multi: false},
       (e,result)=>{
        if(e) return next(e)
        res.send((result=1)? {msg:'success'}:{msg:'error'})
       }
    )
})

//search from database 

app.get('/:collectionName/:search', (req, res, next) => {
  req.collection.find({}).toArray((e, results) => {
      if (e) return next(e);
      let search_object = results.filter((lesson) => {
          return (
              lesson.subject.toLowerCase().match(req.params.search.toLowerCase()) || lesson.location.toLowerCase().match(req.params.search.toLowerCase())
          );
      });
      res.send(search_object);
  });
});

// static image file middleware
app.use(function (req, res, next) {
  let filePath = path.join(__dirname, "static", req.url);
  fs.stat(filePath, function (err, fileInfo) {
      if (err) {
          next();
          return;
      }

      if (fileInfo.isFile()) {
          res.sendFile(filePath);
      } else {
          next();
      }
  });
});
//Logger 

// handling error from the previous middleware
app.use(function (req, res) {
  res.status(404);
  res.send("File not found!");
});

app.listen(5000, () => {
  console.log("Express.js server running at localhost : 5000");
});
