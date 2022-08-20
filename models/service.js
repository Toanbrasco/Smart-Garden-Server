const mongoose = require('mongoose')
const Schema = mongoose.Schema

const servicechema = new Schema({
    image: String,
    title: String,
    content: String,
    contentOutSide: String,
    link: String,
    isPublic: Boolean,
    createdAt: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('services', servicechema);