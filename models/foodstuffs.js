const mongoose = require('mongoose');

const foodList=mongoose.Schema({
    username: String,
    name: String,
    price: Number,
    place: String,
    contactno: Number,
})

module.exports= mongoose.model("Foodstuff",foodList);
