const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

const paymentModel = require("../models/payment");

// Get
router.get('/', verifyToken, async (req, res) => {
    try {
        const Payment = await paymentModel.find();
        res.json({ success: true, Payment })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// Add
router.post('/', async (req, res) => {
    const { name, phone, adress, note, shipping, payment, cart } = req.body
    console.log(req.body)

    if (!name)
        return res
            .status(400)
            .json({ success: false, message: 'Name is required' })

    if (!phone)
        return res
            .status(400)
            .json({ success: false, message: 'PhoneNumber is required' })

    if (!adress)
        return res
            .status(400)
            .json({ success: false, message: 'Adress is required' })


    try {
        const newPayment = new paymentModel({
            name,
            phone,
            adress,
            note,
            shipping,
            payment,
            cart,
            handle: false,
        })

        newPayment.save()
        res.json({ success: true, message: 'Your order has been recorded!' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})
// update Complete
router.put('/:id', verifyToken, async (req, res) => {
    console.log(req.body)
    const { handle } = req.body
    try {
        let updateHandle = {
            handle
        }
        const _id = { _id: req.params.id }

        updateHandle = await paymentModel.findOneAndUpdate(_id, updateHandle)
        // User not authorised to update post or post not found
        if (!updateHandle)
            return res.status(401).json({
                success: false,
                message: 'Server Error'
            })

        res.json({
            success: true,
            message: 'Update success !'
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
        const deletedOrder = await paymentModel.findOneAndDelete(_id)
        if (!deletedOrder)
            return res.status(401).json({
                success: false,
                message: 'Server Error'
            })

        res.json({ success: true, message: 'Order has been Delete Seccess!' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

module.exports = router