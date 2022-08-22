const mongoose = require('mongoose')
const Schema = mongoose.Schema

const serviceSchema = new Schema({
    image: String,
    title: String,
    content: String,
    desc: String,
    isPublic: Boolean,
    createdAt: Date
    // {
    //     type: Date,
    //     default: Date.now
    // },
})

module.exports = mongoose.model('services', serviceSchema);