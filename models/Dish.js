const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dishSchema = new Schema({
    day:{
        type: String,
        required: true
    },
   time:{
        type: String,
        required : true
    },
   imageId:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Dish', dishSchema);