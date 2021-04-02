const express= require('express')
const bodyParser= require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const app= express()
const Home = require('./routes/home')

const Userinfo= require('./models/userinfos');

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);


mongoose.connect(process.env.MONGODB_URI ||  'mongodb://localhost/foodiedb')
.then(res=> console.log(`successuflly connected: ${res}`))
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
    // console.log(foodbyseller)
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

// InsertFoodstuff();


app.get('*',(req,res)=>{
    res.status(404).send("ERROR 404 Not Found")
})

const port= process.env.PORT || 3000

app.listen(port,()=>{
    console.log("App is listening on port "+ port)
    // console.log(`Error listening port ${err}`)
})
