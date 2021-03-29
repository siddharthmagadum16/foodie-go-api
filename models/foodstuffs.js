const mongoose = require('mongoose');

const foodList=mongoose.Schema({
    username: String,
    foodname: String,
    price: Number,
    place: String,
    contactno: Number,
    image: Array  // try changing to object if possible

})

module.exports= mongoose.model("Foodstuff",foodList);


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