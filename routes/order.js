const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

// const Order = require('../models/Order.js')
const order = require("../models/Order.js");

const path = require('path')

// Get All
router.get('/', verifyToken, async (req, res) => {
    try {
        const results = await order.find()
        res.json({
            success: true,
            data: results
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})
// Get



// Add
router.post('/', (req, res) => {
    const { name, phone, adress, note, shipping, payment, cart } = req.body
    const status = "PENDING"
    const createdAt = new Date()
    try {
        const newOrder = new order({
            name,
            phone,
            adress,
            note,
            shipping,
            payment,
            status,
            createdAt,
            cart
        })
        newOrder.save()
        res.json({ success: true, message: 'Đơn hàng của bạn đã được ghi nhận', order: newOrder })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// Update
router.put('/:id', verifyToken, async (req, res) => {
    const { status } = req.body
    console.log(req.body)
    try {
        let updateStatus = {
            status
        }
        const _id = { _id: req.params.id }

        orderUpdate = await order.findOneAndUpdate(_id, updateStatus)
        // User not authorised to update post or post not found
        if (!orderUpdate)
            return res.json({
                success: false,
                message: 'Không tìm thấy đơn hàng cần cập nhật'
            })

        res.json({
            success: true,
            message: 'Cập nhật thành công'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// Delete
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const _id = { _id: req.params.id }
        const deletedOrder = await order.findOneAndDelete(_id)
        if (!deletedOrder)
            return res.json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            })

        res.json({ success: true, message: 'Xoá đơn hàng thành công' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

module.exports = router