const express = require("express");
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.json());
app.set("port", 3000);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

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

app.post('/collection/:collectionName',(req,res,next)=>{
    req.collection.insertOne(req.body,(e,results)=>{
        if(e) return next(e)
        res.send(results.ops);
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
    req.collection.update(
       { _id: new ObjectID (req.params.id)},
       {$set: req.body},
       {safe: true, multi: false},
       (e,result)=>{
        if(e) return next(e)
        res.send((result=1)? {msg:'success'}:{msg:'error'})
       }
    )
})

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

// handling error from the previous middleware
app.use(function (req, res) {
  // Sets the status code to 404
  res.status(404);
  // Sends the error "File not found!”
  res.send("File not found!");
});

app.listen(5000, () => {
  console.log("Express.js server running at localhost : 5000");
});
