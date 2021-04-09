const mongoose = require('mongoose');

const user=mongoose.Schema({
    username: String,
    password: String,
    code: String
})

module.exports= mongoose.model("userverify",user);


/*

img:{
        fieldname : String,
        originalname : String,
        encoding : String,
        mimetype : String,
        destination : String,
        path : String,
        size : Number
}

*/