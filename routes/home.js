const express= require('express')
// const bodyParser= require('body-parser')
// const mongoose = require('mongoose')
const home= require('express').Router();
const {performance} = require('perf_hooks');

const fs= require('fs')
const Path = require('path')
require('dotenv/config')
const multer = require('multer')
const nodemailer= require('nodemailer')

const Foodstuff= require('../models/foodstuffs');
// const { decode } = require('punycode');


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
        // console.log(result)
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
    fs.readdir('../files/'+req.file.filename, (err, files) => {

        if (err) console.log(`readdir error: \n ${err}`);
            fs.unlink('./files/'+req.file.filename, err => {
                if (err) console.log('file unlink error\n '+err);
            })
    })

})

home.post('/sell/insert/getfilepath',upload.single('image'),(req,res)=>{
    console.log('filepath: '+ req.file.path)
    if(req.file.path)   res.json(req.file.path)
    else res.status(404).json("Error fetching file path")
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



const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
      user: 'foodie.go963@gmail.com',
      pass: process.env.TRANSPORTER_PASS
    }
});

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

home.post('/buy/send-order',(req,res)=>{
    console.log(`sending order ...`)
    // console.log(req.body[0])
    let orderId=Math.floor(Math.random()*1000000)+100000;
    let userObj=req.body[0];
    let username= req.body[1];
    let totalprice= req.body[2];
    let objValues= Object.values(userObj)
    let objKeys= Object.keys(userObj)
    let delivery_address=req.body[3]
    let delivery_contactno=req.body[4]
    console.log("contactno "+delivery_contactno.toString())
    let htmldata=``
    let foodieHtmldata=``
    // objValues=objValues
    htmldata+=`<tr><th>Food Name</th><th>Price</th><th>Quantity</th></tr>`
    foodieHtmldata+=`<tr><th>Food Name</th><th>Price</th><th>Quantity</th></tr>`
    console.log(objValues)
    for(let index=0;index<objValues.length;index++){
        for(let ind2=0;ind2<objValues[index].length;ind2++){
            let element=objValues[index][ind2];
            if(element.length==2){
                foodieHtmldata+=`<tr><td>Producer details</td><td>${element[0]}</td><td>${element[1]}</td></tr>`
            }else{
                htmldata+=`<tr><td>${element[0]}</td><td>${element[1]}</td><td>${element[2]}</td></tr>`
                foodieHtmldata+=`<tr><td>${element[0]}</td><td>${element[1]}</td><td>${element[2]}</td></tr>`
            }
        }
    }
    htmldata=`<table border="1px solid black" style="text-align: center; border-spacing: 5px">${htmldata}</table>`
    foodieHtmldata=`<table border="1px solid black" style="text-align: center; border-spacing: 5px">${foodieHtmldata}</table>`

    htmldata=`<h3>Thank you for ordering food from Foodie-go</h3><br/>
                <img src=${'https://i.imgur.com/Cm3Wuc5.png?1'} alt='foodie-go-logo' width=200px  />
            <h4>Food order List:</h4><br/>
                ${htmldata}
            <br/>
            <h4>Order-Id : ${orderId}</h4>
            <h4>Total Price: ₹ ${totalprice}</h4>
            <h5>Your food will get delivered within an hour </h5>
            <h5>Thank you for using Foodie-go services,</h5>
            <br/>
            <h5>Team Foodie-go</h5>
        `
    foodieHtmldata=`
        Food order details:
        <h5>Order-Id: ${orderId}</h5><br/>
        ${foodieHtmldata}
        <h4>Total order price: ${totalprice}</h4>
        <br/>
        <h4>Delivery address: ${delivery_address} </h4>
        <h4>Delivery contact-number: ${delivery_contactno} </h4>
        <h5>Team Foodie-go</h5>
    `

    console.log(username)
    let mailOptions;
    mailOptions = {
        from: 'foodie.go963@gmail.com',
        to: 'foodie.go963@gmail.com',
        subject: `Foodie-go order: ${orderId}`,
        html: foodieHtmldata,
        context:{
          name: 'Foodie-go'
        }
    };

    transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            return res.send("0")
        } else {
            console.log('Email sent: ' + info.response);
        }
    });


    mailOptions = {
        from: 'foodie.go963@gmail.com',
        to: username,
        subject: 'Your order has been successfully sent',
        html: htmldata,
        context:{
          name: 'Foodie-go'
        }
    };

    transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            return res.send("0")
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    for(let producer_index=0;producer_index<objKeys.length;producer_index++){
        console.log("hey")
        htmldata=`<tr><th>Food Name</th><th>Price</th><th>Quantity</th></tr>`
        let producer_price=0;
        for(let food_index=0;food_index<objValues[producer_index].length;food_index++){
            // each food element
            let element=objValues[producer_index][food_index]
            if(element.length===3){
                producer_price+=element[2]*element[1];
                htmldata+=`<tr><td>${element[0]}</td><td>${element[1]}</td><td>${element[2]}</td></tr>`
            }
        }
        htmldata=`<table border="1px solid black" style="text-align: center; border-spacing: 5px">${htmldata}</table>`
        htmldata=`<h3>You have food order from Foodie-go</h3>
            <img src=${'https://i.imgur.com/Cm3Wuc5.png?1'} alt='foodie-go-logo' width=200px  />
            <h4>Order details:</h4>
            ${htmldata}
            <h4>Order-Id : ${orderId}</h4>
            <h4> Total order price: ₹ ${producer_price}

            <h5>Our delivery person will come shortly to pick-up the food items and pay for requested order</h5>
            <h5>Thank you for using Foodie-go services</h5>
            <br/>
            <h5>Team Foodie-go</h5>
        `
        console.log(objKeys[producer_index])
        mailOptions = {
            from: 'foodie.go963@gmail.com',
            to: objKeys[producer_index],
            subject: 'Food order from Foodie-go',
            html: htmldata,
            context:{
              name: 'Foodie-go'
            }
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              return res.send("0")
            }else{
              console.log('Email sent: ' + info.response);
            }
        });


    }



    res.send('1');
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