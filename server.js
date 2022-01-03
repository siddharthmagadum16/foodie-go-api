const express= require('express')
const bodyParser= require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const app= express()

var database_url;

if(process.env.ENV === 'PRODUCTION'){
    database_url = process.env.MONGODB_URI;
}else {
    database_url = 'mongodb://localhost/foodiedb';
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

const port= process.env.PORT || 4000

app.listen(port,()=>{
    console.log("App is listening on port "+ port)
})

