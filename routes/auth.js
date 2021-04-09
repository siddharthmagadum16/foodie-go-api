const express = require('express')
const auth = require('express').Router()


const Userinfo= require('../models/userinfos');
const  userverify= require('../models/userverify')
const bcrypt = require('bcrypt')
const saltRounds=10

const nodemailer= require('nodemailer');
const userverify = require('../models/userverify');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
      user: 'foodie.go963@gmail.com',
      pass: 'foodiegowebsite'
    }
});

// let flag=0;
auth.post('/send-code',(req,res)=>{

    let code = Math.floor(Math.random()*10000)+1000;
    let htmldata= `
        <div>
        <h5>Thank you for registering on foodie-go</h5>
        <h4>Your verification code: ${code}</h4>
        </div>
    `

    let mailOptions = {
        from: 'foodie.go963@gmail.com',
        to: req.body.username,
        subject: 'Foodie-go account verification',
        html: htmldata,
        // template : 'index',
        context:{
          name: 'Foodie-go'
        }
    };

    try{
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                throw "Unable to send email"
            }else{
                console.log('Email sent: ' + info.response);

            }
        })

        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            if(err) throw "unable to store password"+err;
            else{
                bcrypt.hash(code,saltRounds,function(err2,codehash){
                    if(err2) throw "unable to store code"+err2;
                    else{
                        userverify.insertMany({
                            username: req.body.username,
                            password: hash,
                            code    : codehash
                        },(err)=>{
                            if(err)    throw `error occurred while registering a user:${err}`
                                // console.log(`error occurred while registering a user: ${err}`)
                                // return res.json("0")//registeration failed
                            else{
                                finalres=1;
                                console.log(finalres);
                                console.log("Registeration Successful"+`${finalres}`)
                                return res.json("1")
                            }
                        })
                    }
                })
            }
        })
    }catch(err){
        return res.json("0");
    }

})


auth.post('/register',(req,res)=>{
    let finalres=0
    try{
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            if(err){
                throw "unable to store password"
            }else{
                Userinfo.insertMany({
                    username: req.body.username,
                    password: hash

                },(err)=>{
                    if(err){
                        console.log(`error occurred while registering a user: ${err}`)
                        return res.json("0")//registeration failed
                    }
                    else{
                        finalres=1;
                        console.log(finalres);
                        console.log("Registeration Successful"+`${finalres}`)
                        return res.json("1")
                    }
                })
            }

        });
    }catch(err){
        console.log(`Try error occurred while registering a user: ${err}`) ;
        return res.json("0")//registeration failed
    }
    console.log(`finalres ${finalres}`)
})

auth.post('/signin',(req,res)=>{
    console.log('signin request ______')

    Userinfo
    .find({})
    .then(collection=>{
        let result = isValidUser(collection,req.body.username,req.body.password)
        return result;
    })
    .then(valid=>{
        console.log(`valid:  ${valid}`)
        if(parseInt(valid)===1){
            res.json('1')
        }else res.json('0')
    })
    .catch(err=>{
        console.log(err)
        res.json('0')
    })

})

auth.get('/test',(req,res)=>{
    res.send("test ok")
})



async function isValidUser(collection,username,password){
    let index,flag=0;
    for ( index = 0; index < collection.length; index++) {
        flag= await checkUser(username,password,collection[index])
        if(parseInt(flag)){
            return flag;
        }
    }
    return 0;
}

async function checkUser(username, password,user) {

    let match = await bcrypt.compare(password, user.password);
    // console.log(match)
    if(match && user.username===username) {
        return 1;
    }else return 0;
}

module.exports= auth;