const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Tool = require('../models/Tool');
//create Schema 
const OrderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    toolId: [{
        type: Schema.Types.ObjectId,
        ref: "Tool"
    }],
    location: {
        type: String,
    },
    KKS: {
        type: String,
    },
    WO: {
        type: String,
        required: true
    },
    content: {
        type: String,
    },
    note: {
        type: String,
    },
    PCT: {
        type: String,
        required: true
    },
    NV: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    timeStart: {
        type: Date,
        required: true
    },
    timeStop: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    statusTool: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = Order = mongoose.model('order', OrderSchema)