const mongoose = require('mongoose')
const Schema = mongoose.Schema

var productSchema = new Schema({
    images: Array,
    desc: String,
    name: String,
    price: Object,
    isPublic: Boolean,
    info: Array,
    category: Object,
    type: String,
    date: Date
})
// ,{ collection: 'Products'}    
module.exports = mongoose.model('products', productSchema);