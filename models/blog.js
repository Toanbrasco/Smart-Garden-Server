const mongoose = require('mongoose')
const Schema = mongoose.Schema

const blogSchema = new Schema({
    image: String,
    title: String,
    content: String,
    contentOutSide: String,
    link: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    isPublic: Boolean
})

module.exports = mongoose.model('blogs', blogSchema);