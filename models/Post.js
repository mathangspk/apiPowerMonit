const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema 
const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
},
    { timestamps: true }
)

module.exports = Post = mongoose.model('post', PostSchema)