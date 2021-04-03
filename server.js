const express= require('express')
const bodyParser= require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const app= express()
const Home = require('./routes/home')

const Userinfo= require('./models/userinfos');
const bcrypt = require('bcrypt')
const saltRounds=10

let flag=0;

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);

const mongoURL= process.env.MONGODB_URI ||  'mongodb://localhost/foodiedb'
mongoose.connect(mongoURL)
.then(res=> console.log(`successuflly connected: ${res} ${mongoURL}`))
.catch(err=>console.log(`error connecting to db : ${err}`));



app.use(cors())
app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded({ extended: true })); // when data is sent in urlencoded format

app.use('/home/',Home);

function deleteeUserinfo(){
    Userinfo.deleteMany({},(err,result)=>{
        if(err) console.log(`Unable to delete ${moviename} ${err}`);
        else console.log(` Successfully delted: ${result}`);
    })
}
// deleteeUserinfo() //________________________________________________________________
function deleteeFoodstuff(){
    Foodstuff.deleteMany({},(err,result)=>{
        if(err) console.log(`Unable to delete ${moviename} ${err}`);
        else console.log(` Successfully delted: ${result}`);
    })
}
// deleteeFoodstuff() //________________________________________________________________

// */


app.post('/register',(req,res)=>{
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

app.post('/signin',(req,res)=>{
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

let foods=[
    food1= {
        username: 'sid',
        name: 'pizza',
        price: 100,
        rating: 3.5,
        place: 'Dwarka Nagar, Banglore',
        contactno: 948569712
    },
    food2={
        username: 'sid',
        name: 'North Indian Biryani',
        price: 100,
        rating: 3.0,
        place: 'Dwarka Nagar2, Banglore',
        contactno: 948569712
    },
    food3= {
        username: 'sid',
        name: 'Chinese schezwan fried rice',
        price: 100,
        rating: 3.5,
        place: 'Dwarka Nagar3, Banglore',
        contactno: 948569712
    },
    food4={
        username:'sid',
        name: 'Gobi Manchuri',
        price: 50,
        rating: 4.5,
        place: 'Ashok Nagar',
        contactno: 9478219354
    }
]


async function findFoodsbySeller(username){
    let foodbyseller= await Foodstuff.find({username : username})
    return foodbyseller;
}

// temporary
function InsertFoodstuff(){
    try{

        Foodstuff.insertMany({
            username:'sid@gmail.com',
            name: 'Veg Biryani',
            price: '250',
            place: 'PB road vijay colony',
            contactno: 9478219354
        })
    }catch(err){
        console.log(err)
    }
}

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

// InsertFoodstuff();


app.get('*',(req,res)=>{
    res.status(404).send("ERROR 404 Not Found")
})

const port= process.env.PORT || 3000

app.listen(port,()=>{
    console.log("App is listening on port "+ port)
    // console.log(`Error listening port ${err}`)
})
