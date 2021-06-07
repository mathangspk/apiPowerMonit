const mongosee = require('mongoose');
const Schema = mongosee.Schema;

//create Schema 
const CustomerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    phoneNumber: {
        type: Number
    },
    facebook: {
        type: String
    },

},
    { timestamps: true }
)

module.exports = Customer = mongosee.model('customer', CustomerSchema)