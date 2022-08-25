const mongoose = require('mongoose')
const Schema = mongoose.Schema

const imagesSchema = new Schema({
    name: String,
    // image_path: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('images', imagesSchema);