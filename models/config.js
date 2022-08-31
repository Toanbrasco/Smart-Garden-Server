const mongoose = require('mongoose')
const Schema = mongoose.Schema

const configSchema = new Schema({
    category: Array,
    logo: String,
    bannerTitle: String,
    info: Array,
    facebook: String,
    map: String
})

module.exports = mongoose.model('configs', configSchema); 