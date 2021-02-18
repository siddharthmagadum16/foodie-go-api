const mongoose = require('mongoose');

const userinfo=mongoose.Schema({
    username: String,
    password: String
})


module.exports= mongoose.model('userinfo',userinfo)
