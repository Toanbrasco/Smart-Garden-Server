const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

const Service = require('../models/service')

const path = require('path')
const multer = require('multer')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/serviceImages')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage }).single('file')

// Get
router.get('/', async (req, res) => {
    try {
        const serviceItem = await Service.find()
        res.json({ success: true, serviceItem })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})


// Add
router.post('/', verifyToken, (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        const { title, content, contentOutSide, link, isPublic } = req.body
        console.log('1:', title, content, contentOutSide, link, isPublic)
        console.log('2:', req.file)

        // Simple validation
        if (!title)
            return res
                .status(400)
                .json({ success: false, message: 'Title is required' })

        if (!content)
            return res
                .status(400)
                .json({ success: false, message: 'Content is required' })

        if (!contentOutSide)
            return res
                .status(400)
                .json({ success: false, message: 'Content out side is required' })

        if (!link)
            return res
                .status(400)
                .json({ success: false, message: 'Link  is required' })
        try {
            const newService = new Service({
                image: req.file.filename,
                title,
                content,
                contentOutSide,
                link,
                isPublic,
            })
            newService.save()

            res.json({ success: true, message: 'Add Service Seccess!' })
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: 'Internal server error' })
        }
    })
})

// Update
router.put('/', verifyToken, async (req, res) => {
    if (req.body.imgUpdate === false) {
        const { id, title, content, contentOutSide, link, isPublic } = req.body
        if (!title)
            return res
                .status(400)
                .json({ success: false, message: 'Title is required' })

        if (!content)
            return res
                .status(400)
                .json({ success: false, message: 'Content is required' })

        if (!contentOutSide)
            return res
                .status(400)
                .json({ success: false, message: 'content Out Side is required' })
        if (!link)
            return res
                .status(400)
                .json({ success: false, message: 'Link is required' })
        try {
            let updateService = {
                title,
                content,
                contentOutSide,
                link,
                isPublic,
            }
            const _id = { _id: id }

            updateService = await Service.findOneAndUpdate(_id, updateService)
            // User not authorised to update post or post not found
            if (!updateService)
                return res.status(401).json({
                    success: false,
                    message: 'Server Error'
                })

            res.json({
                success: true,
                message: 'Edit success !'
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: 'Internal server error' })
        }
    } else {
        upload(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(500).json(err)
            } else if (err) {
                return res.status(500).json(err)
            }
            const { imgOld, id, title, content, contentOutSide, link, isPublic } = req.body
            console.log(imgOld)
            // Simple validation
            if (!title)
                return res
                    .status(400)
                    .json({ success: false, message: 'Title is required' })

            if (!content)
                return res
                    .status(400)
                    .json({ success: false, message: 'Content is required' })

            if (!contentOutSide)
                return res
                    .status(400)
                    .json({ success: false, message: 'content Out Side is required' })
            if (!link)
                return res
                    .status(400)
                    .json({ success: false, message: 'Link is required' })

            try {
                console.log('img New', req.file)
                const images = req.file.filename
                let updateService = {
                    image: images,
                    title,
                    content,
                    contentOutSide,
                    link,
                    isPublic,
                }
                console.log(updateService)
                const reqPath = path.join(__dirname, '../')
                fs.unlink(reqPath + "/assets/serviceImages/" + imgOld, function (err) {
                    if (err) return console.log(err);
                });

                const _id = { _id: id }
                console.log('ID:', _id)
                updateService = await Service.findOneAndUpdate(_id, updateService)

                // User not authorised to update post or post not found
                if (!updateService)
                    return res.status(401).json({
                        success: false,
                        message: 'Server Error'
                    })

                res.json({
                    success: true,
                    message: 'Edit success !'
                })
            } catch (error) {
                console.log(error)
                res.status(500).json({ success: false, message: 'Internal server error' })
            }
        })
    }

})

// Delete
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const reqPath = path.join(__dirname, '../')
        const _id = { _id: req.params.id }
        console.log(_id)
        const deletedService = await Service.findOneAndDelete(_id)
        fs.unlink(reqPath + "/assets/serviceImages/" + deletedService.name, function (err) {
            return res.status(401).json({ success: false, message: 'Image Not Found!' })
        });
        if (!deletedService)
            return res.status(401).json({
                success: false,
                message: 'Server Error'
            })

        res.json({ success: true, message: 'Delete Product Seccess!' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

module.exports = router
