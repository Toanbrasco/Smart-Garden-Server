const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PaymentSchema = new Schema({
    name: String,
    phone: Number,
    adress: String,
    note: String,
    shipping: String,
    payment: String,
    cart: Array,
    handle: Boolean,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('payments', PaymentSchema)
