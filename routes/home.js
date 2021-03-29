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

async function insertFoodDocument(body,File,encodedImage){
    try{
        Foodstuff.insertMany({
            username:body.username,
            foodname: body.foodname,
            price: parseInt(body.price),
            place: body.place,
            contactno: parseInt(body.contactno),
            image:{
                data: encodedImage,
                contentType: File.mimetype
            }
        })
        return 1
    }catch(err){
        console.log(err)
        return 0
    }
}

home.post('/sell/insert/food',upload.single('image'),(req,res)=>{
    console.log(req.body)


    let file =fs.readFileSync(req.file.path);
    console.log("_________ " +req.body.username)
    let encodedImage = Buffer.from(file).toString('base64')
    console.log(encodedImage.slice(0,9))

    if(insertFoodDocument(req.body,req.file,encodedImage)) res.send('1')
    else res.send('0');
    fs.readdir(req.file.path, (err, files) => {
        if (err) console.log(err);
            fs.unlink(req.file.path, err => {
                if (err) console.log(err);
            })
    })

})



home.post('/sell/insert/food/image',upload.single('image'),(req,res)=>{

    console.log(req.file)
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
    fs.readdir(req.file.path, (err, files) => {
        if (err) console.log(err);
            fs.unlink(req.file.path, err => {
                if (err) console.log(err);
            })
    })

})

home.get('/getimage',(req,res)=>{
    let t0= performance.now()
    Foodstuff.findById("605ebb278433147b8c5d5be5",(err,img)=>{
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
    console.log('______________________________________')
    console.log("username:  "+req.params.username)
    Foodstuff
    .find()
    .or([{username:req.params.username}])
    .then(result=>{
        // console.log(result);
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
            // console.log(`Food Stuff deleted ${result}`)
            res.send('1')
        }
    })
})

module.exports = home;



/*

1[object Object],
2 605edbdf6a328881803efdac,
3 sid@gmail.com,
4 veg fried  rice,
5 102,
6 pb road,
7 937377228,0
<img height='500' width='400' src={`data:image/*;base64,${each[0][0]}`} alt="imagealt" />

*/