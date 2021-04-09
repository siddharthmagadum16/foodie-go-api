const express = require('express')
const auth = require('express').Router()


const Userinfo= require('../models/userinfos');
const  userverify= require('../models/userverify')
const bcrypt = require('bcrypt')
const saltRounds=10

const nodemailer= require('nodemailer');
const { resolve } = require('path');
const { rejects } = require('assert');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
      user: 'foodie.go963@gmail.com',
      pass: 'foodiegowebsite'
    }
});

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

auth.use('/send-code',(req,res,next)=>{
    if(validateEmail(req.body.username)){
        console.log('email validated')
        next();
    }else{
        console.log('invalid email')
        res.send("3");
    }
})

// let flag=0;
auth.post('/send-code',(req,res)=>{

    let code = Math.floor(Math.random()*10000)+1000;
    let htmldata= `
        <div>
        <h5>Thank you for registering on foodie-go</h5>
        <h4>Your verification code: ${code}</h4>
        <h5>Enter the verification code to complete registeration process</h5>
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


    Userinfo
    .find({username: req.body.username})
    .then(user=>{
        if(user.length){
            console.log("user already registered")
            res.send("2") // ALREADY REGISTERED
        }
        else{
            try{
            // send a mail with verification code.
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    // console.log(error);
                    throw error
                    // throw "Unable to send email"
                }else{
                    console.log('Email sent: ' + info.response);

                    // hash the code and store it into userverify collection
                    bcrypt.hash(code.toString(),saltRounds,function(err2,codehash){
                        if(err2) throw `unable to store code ${err2}`;
                        else{
                            // delete existing verification codes if any
                            userverify.deleteMany({username: req.body.username},(err3)=>{
                                if(err3)
                                throw `error while deleting user from user-verify collection:\n+${err3}`
                            })
                            // insert username and code
                            userverify.insertMany({
                                username: req.body.username,
                                code    : codehash
                            },(err)=>{
                                if(err)    throw `error occurred while registering a user:${err}`
                                    // console.log(`error occurred while registering a user: ${err}`)
                                    // return res.json("0")//registeration failed
                                else{
                                    console.log("email has been sent successfully")
                                    return res.json("1") //SUCCESS
                                }
                            })
                        }
                    })
                }
            })
            }
            catch(err){
                console.log(err)
                res.send("0")
            }

        }
    })
    .catch(err=>{
        console.log(err) ; return res.json("0")
    })
})

auth.post('/register',(req,res)=>{
    console.log("registering .....")
    userverify
    .find({username: req.body.username})
    .then(user=> {
        if(user.length===0){
            throw `User didn not verify email before while registering`
        }
        console.log(user[0].code);
        return bcrypt.compare( req.body.code,user[0].code)
    })
    .then(match=>{
        console.log(match)
        // let match =  bcrypt.compare(user[0].code, req.body.code)
        if(match){
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                if(err){
                    throw `unable to store password: ${err}`
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
                            console.log("Registeration Successful")
                            return res.json("1")
                        }
                    })
                }

            });
            // cleanup the collection from userverify database after completion of registeration process
            userverify.deleteMany({username: req.body.username},(err3)=>{
                if(err3){
                    throw `error while deleting user from user-verify collection:\n ${err3}`
                }
            })
        }
        else res.send("2") // INVALID CODE
    })
    .catch(err=>{
        console.log(err); res.send("0")
    })
})

auth.post('/register/depreciated',(req,res)=>{
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