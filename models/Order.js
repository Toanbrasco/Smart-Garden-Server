const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
    name: String,
    adress: String,
    phone: String,
    note: String,
    shipping: String,
    payment: String,
    cart: Array,
    status: String,
    createdAt: Date
    // {
    //     type: Date,
    //     default: Date.now
    // }
})

module.exports = mongoose.model('orders', orderSchema)
