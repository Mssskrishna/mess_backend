const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const complaintSchema = new Schema({
    Id:{
        type: String,
        required: true
    },
    Type:{
        type: String,
        required : true
    },
    text:{
        type: String
    },
    image:{
        type: String,
    },
    tag:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Complaint', complaintSchema);