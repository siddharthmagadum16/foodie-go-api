const express= require('express')
const bodyParser= require('body-parser')
const mongoose = require('mongoose')
const home= require('express').Router();

const fs= require('fs')
const Path = require('path')
require('dotenv/config')
const multer = require('multer')

const Foodstuff= require('../models/foodstuffs');


home.use(express.json())
home.use(express.urlencoded({extended:false})); //Parse URL-encoded bodies
// home.use(express.static(__dirname + '/public'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dirName =Path.join(process.cwd(), './files/')
        console.log(dirName)
        if (!fs.existsSync(dirName)){
                fs.mkdirSync(dirName);
        }
            cb(null,dirName)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+'-'+file.originalname)
  }

})
var upload = multer({ storage: storage });


home.get('/buy',(req,res)=>{
    // foods=0
    Foodstuff
    .find()
    .or({})
    .then(result=>{
        console.log(result)
        res.send(result)
    })
    .catch(err=> {
        console.log(`err while buying food ${err}`)
        res.send("Error while fetching food items")
    })
    // res.send(foods)
})


home.post('/sell/insert/food',upload.single('image'),(req,res)=>{
    // console.log(req.body)
    // // console.log('REQ.BODY '+ req.body.img)
    // console.log(__dirname +"<-dirname");
    // let path= Path.join(__dirname + '/uploads/' + req.file.filename)

    Foodstuff.insertMany({
        username:req.body.username,
        name: req.body.name,
        price: req.body.price,
        place: req.body.place,
        contactno: req.body.contactno,
        // img: {
        //     data: fs.readFileSync(path),
        //     contentType: 'image/png'
        // }
    },(err,result)=>{
        if(err) res.send("0")
        else{
            console.log(result)
            res.send("1")
        }
    })
})



home.post('/sell/insert/food/image',upload.single('image'),(req,res)=>{
    console.log(req.file.destination) // image url

    let foodimage= req.file ;
    console.log(req.file.fieldname)
    let path = Path.join(__dirname + '/uploads/ ' + req.file.filename )

    console.log(foodimage)
    var obj = {
        name: "veg pulao",
        image:{
            data: fs.readFileSync(path),
            contentType: 'image/png'
        }
    }
    // fs.readFile(req.file.path,)
    Foodstuff.insertMany(obj,(err,result)=>{
        if(err) res.send("0")
        else {
            console.log(result)
            res.send("1")
        }
    })

})


home.post('/sell/:username',(req,res)=>{
    console.log("username:  "+req.params.username)
    Foodstuff
    .find()
    .or([{username:req.params.username}])
    .then(result=>{
        console.log(result);
        res.send(result)
    })
    .catch(err=>{
        console.log(`err occured ${err}`)
        res.status(404).send("0")
    })
})


home.post('/sell/delete/:username/:foodid',(req,res)=>{
    console.log(`delte post req sent`)
    Foodstuff.findByIdAndDelete(req.params.foodid,(err,result)=>{
        if(err){
            console.log(`err deleting foodstuff in server ${err}`)
            res.send('0')
        }
            else{
            console.log(`Food Stuff deleted ${result}`)
            res.send('1')
        }
    })
})

module.exports = home;



/*

 let fieldname = req.file.fieldname;
    let originalname = req.file.originalname;
    let encoding = req.file.encoding;
    let mimetype = req.file.mimetype;
    let destination = req.file.destination;
    let path = req.file.path;
    let size = req.file.size;


image: {
    fieldname : fieldname,
    originalname : originalname,
    encoding : encoding,
    mimetype : mimetype,
    destination : destination,
    path : path,
    size : size
}


{
  fieldname: 'image',
  originalname: 'slackprofile.png',
  encoding: '7bit',
  mimetype: 'image/png',
  destination: 'D:\\web-dev2\\foodie-go-api\\files\\',  filename: '1616432322406-slackprofile.png',
  path: 'D:\\web-dev2\\foodie-go-api\\files\\1616432322406-slackprofile.png',
  size: 511192
}




*/