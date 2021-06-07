const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//create Schema 
const BptcSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    BPTC: {
        type: String,
        required: true
    },
    JSA: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    note: {
        type: String,
    },
    groupNumber: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = Bptc = mongoose.model('bptc', BptcSchema)