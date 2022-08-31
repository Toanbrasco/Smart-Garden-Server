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
const reqPath = path.join(__dirname, '../')

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

// Update
router.post('/update', verifyToken, (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        const { Old, New } = req.body
        console.log(`=>  req.body`, req.body)
        const NewImage = New.split(',');
        const OldImage = Old.split(',');
        console.log(`=> NewImage`, NewImage)
        console.log(`=> oldImage`, OldImage)
        const ItemNotRemove = OldImage.filter(item => NewImage.includes(item))
        console.log(`NewFile`, req.file)
        const ItemRemove = OldImage.filter(item => !NewImage.includes(item))
        if (ItemRemove) {
            ItemRemove.forEach(item => {
                const find = { name: item }
                const deleteImage = Images.findByIdAndDelete(find)
                console.log(`=> find`, find)
                if (!deleteImage)
                    return res.json({ success: false, imageMessage: 'Không tìm thấy hình để xoá' })
                fs.unlink(reqPath + "/assets/images/" + item, function (err) {
                    if (err) return console.log(err);
                });
            })
        }
        if (!req.files) {
            return res.json({ success: true, images: ItemNotRemove })

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
            res.status(500).json({ success: false, imageMessage: 'Internal server error' })
        }
    })
})

// Delete
router.post('/delete', verifyToken, async (req, res) => {
    const { images } = req.body
    console.log(`=> req.body`, req.body)
    console.log(`=> images`, images)
    try {
        images.forEach(item => {
            const find = { name: item }
            const deleteImage = Images.findByIdAndDelete(find)
            if (!deleteImage)
                return res.json({ success: false, imageMessage: 'Không tìm thấy hình để xoá' })
        })
        images.forEach(item => {
            const find = { name: item }
            const deleteImage = Images.findByIdAndDelete(find)
            console.log(`=> find`, find)
            if (!deleteImage)
                return res.json({ success: false, imageMessage: 'Không tìm thấy hình để xoá' })
            fs.unlink(reqPath + "/assets/images/" + item, function (err) {
                if (err) return console.log(err);
            });
        })

        res.json({ success: true, imageMessage: 'Delete Image Seccess!' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, imageMessage: 'Internal server error' })
    }
})

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const id = { _id: req.params.id }
        const deleteImage = await Images.findByIdAndDelete(id)
        console.log(`=> id`, id)

        if (!deleteImage)
            return res.json({ success: false, imageMessage: 'Không tìm thấy hình để xoá' })

        fs.unlink(reqPath + "/assets/images/" + item, function (err) {
            if (err) return console.log(err);
        });

        res.json({ success: true, imageMessage: 'Delete Image Seccess!' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, imageMessage: 'Internal server error' })
    }
})
// Get ALl

router.get('/', verifyToken, async (req, res) => {
    try {
        const imagesItem = await Images.find();
        if (!imagesItem) {
            res.status(500).json({ success: false, message: 'Internal server error' })
        }
        res.json({ success: true, data: imagesItem })
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


// --------------------------
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
