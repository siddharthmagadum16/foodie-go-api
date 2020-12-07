const express= require('express')
const bodyParser= require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const app= express()


mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);


mongoose.connect('mongodb://localhost/foodiedb')
.then(res=> console.log(`successuflly connected: ${res}`))
.catch(err=>console.log(`error connecting to db : ${err}`));


const userinfo=mongoose.Schema({
    username: String,
    password: String
})

const foodList=mongoose.Schema({
        username: String,
        name: String,
        price: Number,
        rating: Number,
        place: String,
        contactno: Number
})

const Userinfo = mongoose.model('userinfo',userinfo)
const Foodstuff = mongoose.model('foodstuff',foodList)

app.use(cors())
app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded({ extended: true })); // when data is sent in urlencoded format

// /**

function deletee(){
    // foodiedb.userinfo.remove({})
    // mongoose.connection.dropCollection()
    Userinfo.deleteMany({},(err,result)=>{
        if(err) console.log(`Unable to delete ${moviename} ${err}`);
        else console.log(` Successfully delted: ${result}`);
    })
}
// deletee() //________________________________________________________________

// */


app.post('/register',(req,res)=>{
    let finalres=0
    try{
        // let valid=0;
        // for (let i in req.body.username) {
        //     if(i==="@") valid=1
        // }
        // if(valid===0){
        //     return res.json('0')
        // }
        Userinfo.insertMany({
            username: req.body.username,
            password: req.body.password

        },(err)=>{
            if(err){
                console.log(`error occurred while registering a user: ${err}`)
                return res.json("0")//registeration failed
            }
            else{
                finalres=1;
                console.log(finalres);
                console.log("Registeration Successful"+`${finalres}`)
                // return res.send(req.body)
                return res.json("1")
            }
        })
    }catch(err){
        console.log(`Try error occurred while registering a user: ${err}`) ;
        return res.json("0")//registeration failed
    }
    console.log(`finalres ${finalres}`)
})

app.post('/signin',(req,res)=>{
    Userinfo.findOne({username: req.body.username, password: req.body.password },(err,result)=>{
        if(err){
            console.log(`Error while finding userinfo in db ${err}`)
            res.json('0')
        }else{
            console.log(`${result}`)
            if(result!==null)   res.json('1')
            else res.json('0')
            // res.json(`userinfo found in db `)
        }
    })
})

let foods=[
    food1= {
        id: 1,
        name: 'pizza',
        price: 100,
        rating: 3.5/5,
        place: 'Dwarka Nagar, Banglore',
        contactno: 948569712,
    },
    food2={
        id: 2,
        name: 'North Indian Biryani',
        price: 100,
        rating: 3.5/5,
        place: 'Dwarka Nagar2, Banglore',
        contactno: 948569712,
    },
    food3= {
        id: 3,
        name: 'Chinese schezwan fried rice',
        price: 100,
        rating: 3.5/5,
        place: 'Dwarka Nagar3, Banglore',
        contactno: 948569712,
    }
]


app.get('/home/buy',(req,res)=>{
    // foods=0

    res.send(foods)
})

app.get('./home/sell',(req,res)=>{
    Foodstuff.insertMany({
        username:req.body.username,
        name: req.body.name,
        price: req.body.price,
        rating: req.body.rating,
        place: req.body.place,
        contactno: req.body.contactno
    },(err,result)=>{
        if(err) res.send("0")
        else{
            console.log(result)
            res.send("1")
        }
    })
})

async function findFoodsbySeller(username){
    let foodbyseller= await Foodstuff.find({username : username})
    console.log(foodbyseller)
    return foodbyseller;
}

app.get('/home/sell/:username',(req,res)=>{
    console.log("username:  "+req.params.username)
    // sendList=  findFoodsbySeller(req.params.username)
    // Foodstuff.findMany({'username':req.params.username},(err,result)=>{
    //     if(err) res.status(404).send("0")
    //     else{
    //         res.send(result)
    //     }
    // })
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

    // foodiedb.Foodstuff


    // let foodbyseller= Foodstuff.find({username : req.params.username})
    // console.log(foodbyseller)
    // res.send(foodbyseller)
})

// temperoary
function InsertFoodstuff(){
    try{

        Foodstuff.insertMany({
            username:'sid',
            name: 'Gobi Manchuri',
            price: '50',
            rating: 4.5,
            place: 'Ashok Nagar',
            contactno: 9478219354
        })
    }catch(err){
        console.log(err)
    }
}

// InsertFoodstuff();


app.get('*',(req,res)=>{
    res.status(404).send("ERROR 404 Not Found")
})

const port= process.env.PORT || 3000

app.listen(port,()=>{
    console.log("App is listening on port "+ port)
})
