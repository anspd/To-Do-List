var express=require('express')
var app=express()
var bodyParser=require('body-parser')
var MongoClient = require('mongodb').MongoClient
var assert = require('assert');
var db

app.use(bodyParser.urlencoded({extended: true}))

var url = 'mongodb://anspd:asdf1234qwe@ds030500.mlab.com:30500/tododata';

MongoClient.connect(url, function(err, database) {
  assert.equal(null, err)
  db=database
  console.log("Connected successfully to server")
 })


  app.listen(3000, function() {
   console.log('listening on 3000')
})

/*
var insertDocument = function(db,callback) {
  db.collection('users').insertOne({
    "email":"admin@todo.list",
    "pwd":"password"
  }, function(err, result) {
    assert.equal(err,null)
    console.log("done.")
    callback()
  })
}

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err)
  console.log("Connected successfully to server")
  insertDocument(db,function() {
    db.close()
  })
 })
*/

app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/login.html')
})


var objId


var display = function(res){
      db.collection('todos').find({parentId: objId}).toArray(function(err,result){
        if(err) throw err
        console.log(result)
        res.send(result)
      })
    }

app.post('/todolist', (req, res) => {
  var query = req.body
  var count=db.collection('users').count(query,function(err,result) {
     if(err) throw err
     if(result==1)  {
       db.collection('users').findOne(query,(err,obj) => {
         objId = obj._id
       })
       res.sendFile(__dirname + '/index.html')
     }
     else res.redirect('/') 
  })
})

var insertDocument = function(db,body, callback) {
   db.collection('users').insert( { email: body.email , pwd: body.pwd }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the users collection.");
    callback();
  })
}

app.post('/signup', (req,res) => {
  console.log(req.body)
  var query = {email: req.body.email}
  var count=db.collection('users').count(query, (err,result) => {
    if(err) throw err
    if(result == 0)
     insertDocument(db,req.body, function() {
       res.redirect('/')
     });
     else res.redirect('/')
    })
  })


app.post('/initialize', (req,res)=> {
  display(res)
})


app.post('/add', (req,res) => {
  console.log(req.body)
  console.log({ parentId: objId, todo: req.body.todo, isCmpltd:"no" })
  db.collection('todos').insert( { parentId: objId, todo: req.body.todo, isCmpltd:"no" }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a todo into the todos collection.");
    display(res)
  })
})

app.post('/remove', (req,res) => {
  db.collection('todos').findOneAndDelete( { parentId: objId, todo: req.body.todo }, function(err, result) {
    assert.equal(err, null);
    console.log(result)
    console.log("Removed a todo from the todos collection.");
    display(res)
  })
})

app.post('/isCmpltdYes', (req,res) => {
  console.log(req.body)
  db.collection('todos').findOneAndUpdate( { parentId: objId, todo: req.body.todo }, {$set: {isCmpltd:"yes"}}, (err,result)=> {
    if(err) console.log(err)
    console.log(result)
    res.send()
  })
})

app.post('/isCmpltdNo', (req,res) => {
  console.log(req.body)
  db.collection('todos').findOneAndUpdate( { parentId: objId, todo: req.body.todo }, {$set: {isCmpltd:"no"}}, (err,result)=> {
    if(err) console.log(err)
    console.log(result)
    res.send()
  })
})


  