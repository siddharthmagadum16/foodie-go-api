const express= require('express')
const bodyParser= require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const app= express()



// setting database url according to environment
var database_url;
if(app.get('env')==='development'){
    database_url='mongodb://localhost/foodiedb'
}else{
    database_url= process.env.MONGODB_URI
}

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(database_url)
.then(res=> console.log(`successuflly connected: ${res} ${database_url}`))
.catch(err=>console.log(`error connecting to db : ${err}`));


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true })); // when data is sent in urlencoded format

app.use('/home/',require('./routes/home'))
app.use('/auth',require('./routes/auth'))


app.get('*',(req,res)=>{
    res.status(404).send("ERROR 404 Not Found")
})

const port= process.env.PORT || 3000

app.listen(port,()=>{
    console.log("App is listening on port "+ port)
    // console.log(`Error listening port ${err}`)
})



// InsertFoodstuff();
/*
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


function deleteeUserinfo(){
    Userinfo.deleteMany({},(err,result)=>{
        if(err) console.log(`Unable to delete ${moviename} ${err}`);
        else console.log(` Successfully delted: ${result}`);
    })
}



function deleteeFoodstuff(){
    Foodstuff.deleteMany({},(err,result)=>{
        if(err) console.log(`Unable to delete ${moviename} ${err}`);
        else console.log(` Successfully delted: ${result}`);
    })
}
// deleteeFoodstuff() //________________________________________________________________


// deleteeUserinfo() //________________________________________________________________

    */
