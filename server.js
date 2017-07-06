var express=require('express')
var app=express()
var bodyParser=require('body-parser')
var MongoClient = require('mongodb').MongoClient
var ObjectId= require('mongodb').ObjectID
var url = 'mongodb://anspd:asdf1234qwe@ds030500.mlab.com:30500/tododata';
var port=process.env.PORT || 3000

app.use(bodyParser.urlencoded({extended: true}))

var db
MongoClient.connect(url, function(err, database) {
  if(err) throw err
  db=database
  console.log("Connected successfully to database server")
 })

 app.listen(port, function() {
   console.log('listening on 3000')
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

var objId

app.post('/users/todos', (req,res) => {
  var query = req.body
  console.log(query)
  db.collection('users').findOne(query,function(err,obj) {
     if(err) throw err
     if(obj) {
         console.log(obj)
         objId = obj._id
         console.log("Logged in")
         res.sendFile(__dirname + '/home.html')
     }
     else {
         console.log("Email Address or Password not found")
         res.redirect('/')
     }
  })
})

app.post('/users', (req,res) => {
  var query = {email: req.body.email}
  db.collection('users').findOne(query,function(err,obj) {
     if(err) throw err
     if(obj) {
         console.log("User already exists")
         res.redirect('/')
     }
     else {
         if(req.body.pwd==req.body.confpwd) {
             db.collection('users').insert( { email: req.body.email , pwd: req.body.pwd }, function(err, result) {
                 if(err) throw err
                 console.log("Login to continue")
                 res.redirect('/')
             })
         }
         else {
             console.log("Passwords do not match")
             res.redirect('/')
         }
     }
  })
})

var display = function(res){
      db.collection('todos').find({parentId: objId}).toArray(function(err,result){
        if(err) throw err
        console.log("Sending all the todos in response")
        console.log(result)
        res.send(result)
      })
    }

app.get('/todos', (req,res)=> {
  display(res)
})

app.post('/todos', (req,res) => {
  console.log({ parentId: objId, todo: req.body.todo, isCmpltd:"no" })
  db.collection('todos').insert( { parentId: objId, todo: req.body.todo, isCmpltd:"no" }, function(err, result) {
    if(err) throw err
    console.log("Inserted a todo into the todos collection.");
    display(res)
  })
})

app.delete('/todos/:id', (req,res) => {
  var query={"parentId": objId,"_id": new ObjectId(req.params.id)}
  try{
    db.collection('todos').deleteOne(query)
    console.log("Removed a todo from the todos collection.");
    display(res)
  }
  catch(e) {
    print(e)
  }
})

app.put('/todos/:id', (req,res) => {
    var query={"parentId": objId,"_id": new ObjectId(req.params.id)}
    console.log(query)
 db.collection('todos').findOne( query, (err,result)=> {
    if(err) console.log(err)
    console.log(result)
    if(result.isCmpltd=="yes")
    db.collection('todos').updateOne({_id: result._id},{$set: {isCmpltd:"no"}})
    else if(result.isCmpltd=="no")
    db.collection('todos').updateOne({_id: result._id},{$set: {isCmpltd:"yes"}})
    console.log("Updated a record")
    res.send()
  })
})