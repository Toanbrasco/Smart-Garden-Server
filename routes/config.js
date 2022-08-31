const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

const Config = require('../models/config')

const path = require('path')
const multer = require('multer')
const fs = require('fs')



router.put('/update', verifyToken, async (req, res) => {
    const { _id, type, data } = req.body
    console.log(`=> req.body`, req.body)
    try {
        const id = { _id: _id }
        let update = {}
        switch (type) {
            case 'INFO':
                update = { info: data }
                break;

            case 'FB':
                update = { facebook: data }
                break;

            case 'CATEGORY':
                update = { category: data }
                break;

            case 'LOGO':
                update = { logo: data }
                break;

            case 'CONTACT':
                update = { info: data }
                break;

            case 'MAP':
                update = { map: data }
                break;

            case 'TITLE':
                update = { title: data }
                break;

            default:
                return res.json({ success: false, message: 'Không tìm thấy config cần update' })
                break;
        }

        console.log(`=> update`, update)
        const UpdateConfig = await Config.findOneAndUpdate(id, update)

        if (!UpdateConfig)
            return res.json({ success: false, message: 'Không tìm thấy config' })

        res.json({ success: true, message: 'Cập nhật thành công' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: 'Internal server error' })
    }
})
// Get All config
router.get('/', async (req, res) => {
    try {
        const config = await Config.find()
        return res.json({ success: true, data: config })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: 'Internal server error' })
    }
})

module.exports = router