const express= require('express')
const bodyParser= require('body-parser')
const mongoose = require('mongoose')
const home= require('express').Router();
const {performance} = require('perf_hooks');

const fs= require('fs')
const Path = require('path')
require('dotenv/config')
const multer = require('multer')

const Foodstuff= require('../models/foodstuffs');
const { decode } = require('punycode');


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

    console.log(req.file)
    // let path = Path.join(__dirname + '/uploads/ ' + req.file. )
    // var encodedImage = new Buffer(data, 'binary').toString('base64');
    let file =fs.readFileSync(req.file.path);
    console.log("_________")
    let encodedImage = Buffer.from(file).toString('base64')
    console.log(encodedImage.slice(0,9))
    var obj = {
        name: "aloo paneer",
        image:{
            data: encodedImage,
            contentType: req.file.mimetype
        }
    }
    // fs.readFile(req.file.path,)
    Foodstuff.insertMany(obj,(err,result)=>{
        if(err)
            res.send("0");
        else {
            console.log(result)
            res.send("1")
        }
    })


    // to remove the uploaded file which was stored in file folder
    // fs.readdir(req.file.path, (err, files) => {
    //     if (err) console.log(err);
    //     // for (const file of files) {
    //         fs.unlink(req.file.path, err => {
    //             if (err) console.log(err);
    //         })
    //         // }
    // })

})

home.get('/getimage',(req,res)=>{
    let t0= performance.now()
    Foodstuff.findById("605c9f2b3344d3343041bbe0",(err,img)=>{
        // console.log(img.id)
        let tmp = img.image.contentType
        imageinfo = img
        // console.log(imageinfo.image) // never log .image
        console.log(imageinfo.image[0].data.slice(0,9))
        console.log(tmp)
        let final;
        // let final = `<img src={data:${imageinfo.image[0].contentType};base64,${imageinfo.image[0].data}} alt="imagealt" />`
        // res.send(final.json())
        // res.json(final)
        // console.log(final)
        final=[imageinfo.image[0].contentType,imageinfo.image[0].data]
        res.json(imageinfo.image[0].data)
    })
    let t1= performance.now()
    console.log("getimage backend time: ")
    console.log( t1-t0)
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


 Foodstuff.find({name: "siddharth"},(err,result)=>{
        if(err) console.log(err)
        console.log(result)
        // let decodedImage = new Buffer(encodedImage, 'base64').toString('binary')
        let decodedImage=  Buffer.from(result[0].image[0].toString('binary'))
        upload.single(decodedImage)
        console.log(decodedImage)
        try{
            res.send(decodedImage)
        }catch(e){
            console.log(e)
            res.send("0")
        }
        // let encodedImage = Buffer.from(file.toString('base64'))

    })

*/