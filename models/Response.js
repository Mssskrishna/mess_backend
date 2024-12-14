const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responseSchema = new Schema({
    complaintId:{
        type:String,
        required:true
    },
    response:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('Response',responseSchema);