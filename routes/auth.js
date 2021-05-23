const auth = require('express').Router()


const Userinfo= require('../models/userinfos');
const  userverify= require('../models/userverify')
const bcrypt = require('bcrypt')
const saltRounds=10
const EmailValidator = require('email-validator')

const nodemailer= require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
      user: 'foodie.go963@gmail.com',
      pass: process.env.TRANSPORTER_PASS
    }
});

function validateEmail(email) {
    return EmailValidator.validate(email);
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

auth.post('/send-code',(req,res)=>{

    let code = Math.floor(Math.random()*10000)+1000;
    let htmldata= `
        <div>
        <h4>Thank you for registering on foodie-go</h4>
        <img src=${'https://i.imgur.com/Cm3Wuc5.png?1'} alt='foodie-go-logo' width=200px  />
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
                    throw error                    // throw "Unable to send email"
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
    userverify
    .find({username: req.body.username})
    .then(user=> {
        if(user.length===0){
            throw `User did not verify email before while registering`
        }
        return bcrypt.compare( req.body.code,user[0].code)
    })
    .then(match=>{
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


auth.post('/signin',(req,res)=>{

    Userinfo
    .find({})
    .then(collection=>{
        return isValidUser(collection,req.body.username,req.body.password)
    })
    .then(valid=>{
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
    if(match && user.username===username) {
        return 1;
    }else return 0;
}

module.exports= auth;