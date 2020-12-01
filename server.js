const express= require('express')
const bodyParser= require('body-parser')
const cors = require('cors')

const app= express()

const data={
    name: 'siddharth', srn: 'PES1UG19CS482'
}

app.use(cors())
app.use(bodyParser.json())

app.get('/',(req,res)=>{
    res.json('Home')
})

app.get('/about',(req,res)=>{
    res.json('about')
})

app.get('/signin',(req,res)=>{
    res.json("Signin")
})

app.get('/register',(req,res)=>{
    res.json("Register")
})

app.post('/signin',(req,res)=>{
    if(req.username==='sid'){
        return    res.json("Signin approved")
    }
    res.json("User not found")
})


const port= process.env.PORT || 3000

app.listen(port,()=>{
    console.log("App is listening on port "+ port)
})
/*

*/