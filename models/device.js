const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//create Schema 
const DeviceSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    sn: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
})

module.exports = Device = mongoose.model('device', DeviceSchema)