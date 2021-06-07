const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//create Schema 
const MqttSchema = new Schema({
    topic: {
        type: String,
        required: true
    },
    localIp: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    randomString: {
        type: Date,
        required: true
    },
    volt: {
        type: String,
    },
    current: {
        type: String,
    },
    power: {
        type: String,
    },
    energy: {
        type: String,
    },
    frequency: {
        type: String,
    },
    powerfactor: {
        type: String,
    },
    date: {
        type: Date,
    }
})

module.exports = Mqtt = mongoose.model('mqtt', MqttSchema)