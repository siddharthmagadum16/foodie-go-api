const express= require('express')
const bodyParser= require('body-parser')
const mongoose = require('mongoose')
const home= require('express').Router();

const Foodstuff= require('../models/foodstuffs');


home.use(express.json())

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
        console.log(`err while buying food ${err} `)
        res.send("Error while fetching food items")
    })
    // res.send(foods)
})


home.post('/sell/insert/food',(req,res)=>{
    console.log(req)
    // console.log("hi")
    // res.send("hello")
    Foodstuff.insertMany({
        username:req.body.username,
        name: req.body.name,
        price: req.body.price,
        place: req.body.place,
        contactno: req.body.contactno,
    },(err,result)=>{
        if(err) res.send("0")
        else{
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