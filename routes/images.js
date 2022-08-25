const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

// const http = require('http')
// const fs = require('fs')
// const url = require('url')

const Post = require('../models/Post')
const Products = require('../models/Product')
const Images = require('../models/images')

const path = require('path')
// const fileType = require('file-type')
const multer = require('multer')
const fs = require('fs')

// @route GET api/posts
// @desc Get posts
// @access Private

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/images')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage }).array('file')

// Upload
router.post('/', verifyToken, (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        if (!req.files) {
            res.json({ success: false, name: req.file.filename, imageMessage: "Không có file Hình nào" })
            return
        }
        let ArrImage = []
        req.files.forEach((item) => {
            ArrImage.push(item.filename)
        })
        try {
            req.files.forEach((item) => {
                const image = new Images({
                    name: item.filename
                })
                image.save()
            })
            res.json({ imageSuccess: true, images: ArrImage })
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: 'Internal server error' })
        }
    })
    // console.log(req.file)
});
router.post('/update', verifyToken, (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        const ItemNotRemove = oldImage.filter(item => NewImage.includes(item))
        const { oldImage, NewImage } = req.body
        const ItemRemove = oldImage.filter(item => !NewImage.includes(item))
        if (ItemRemove) {
            ItemRemove.forEach(item => {
                const find = { name: item }
                Images.findByIdAndDelete(find)
                if (!deleteImage)
                    return res.json({ success: false, message: 'Không tìm thấy hình để xoá' })
                fs.unlink(reqPath + "/assets/images/" + item, function (err) {
                    if (err) return console.log(err);
                });
            })
        }
        if (!req.files) {
            res.json({ success: true, images: ItemNotRemove, imageMessage: "Không có file Hình nào" })
            return
        }
        let ArrImage = []
        req.files.forEach((item) => {
            ArrImage.push(item.filename)
        })
        try {
            req.files.forEach((item) => {
                const image = new Images({
                    name: item.filename
                })
                image.save()
            })
            res.json({ imageSuccess: true, images: [...ArrImage, ...ItemNotRemove] })
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: 'Internal server error' })
        }
    })
})

// Delete
router.post('/:id', verifyToken, async (req, res) => {
    console.log(req.params.id)
    try {
        const reqPath = path.join(__dirname, '../')
        const _id = { _id: req.params.id }
        const deleteImage = await Images.findByIdAndDelete(_id)
        fs.unlink(reqPath + "/assets/images/" + deleteImage.name, function (err) {
            if (err) return console.log(err);
        });
        if (!deleteImage)
            return res.status(401).json({
                success: false,
                message: 'Server Error'
            })

        res.json({ success: true, message: 'Delete Image Seccess!' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.get('/', async (req, res) => {
    try {
        const imagesItem = await Images.find();
        res.json({ success: true, imagesItem })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// Get Image
router.get('/:name', (req, res) => {
    try {
        const reqPath = path.join(__dirname, '../')
        const name = req.params.name
        res.sendFile(reqPath + "/assets/images/" + name);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ message: 'No such image file' })
        } else {
            res.status(500).json({ message: error.message })
        }
    }

})
router.get('/blog/:name', (req, res) => {
    try {
        const reqPath = path.join(__dirname, '../')
        const name = req.params.name
        res.sendFile(reqPath + "/assets/blogImages/" + name);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ message: 'No such image file' })
        } else {
            res.status(500).json({ message: error.message })
        }
    }

})
router.get('/service/:name', (req, res) => {
    try {
        const reqPath = path.join(__dirname, '../')
        const name = req.params.name
        res.sendFile(reqPath + "/assets/serviceImages/" + name);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ message: 'No such image file' })
        } else {
            res.status(500).json({ message: error.message })
        }
    }

})
router.get('/product/:name', (req, res) => {
    try {
        const reqPath = path.join(__dirname, '../')
        const name = req.params.name
        res.sendFile(reqPath + "/assets/images/products" + name);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ message: 'No such image file' })
        } else {
            res.status(500).json({ message: error.message })
        }
    }

})

// router.get('/', (req, res) => {
//     console.log(`Get: req = ${req}`)
//     const start = parseInt(req.query.start) || 0
//     const limit = parseInt(req.query.limit) || 20

//     Images.find({}, { name: 1, _id: 0 }).sort({ created_at: -1 }).skip(start).limit(limit).exec((err, docs) => {
//         if (err) {
//             console.log(err)
//             return res.status(500).json({ message: err.message, data: null })
//         }

//         res.status(200).json({
//             message: 'Get data successfully',
//             data: docs.map(e => e.name)
//         })
//     })
// })

// router.post("/test", (req, res) => {
//     res.status(200).send("Nice")
// })



module.exports = router
