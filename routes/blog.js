const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

const Blog = require('../models/blog')

const path = require('path')
const multer = require('multer')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/blogImages')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage }).single('file')


// Get All Blog
router.get('/', async (req, res) => {
    let count = 0
    try {
        const blogItem = await Blog.find()
        console.log('Get blog')
        // res.setHeader('Content-Type', 'text/plain');
        // count += 1
        // res.setHeader('Content-Type', 'text/plain');
        return res.json({ success: true, blogItem })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
    console.log(count)
})

// Add Blog
router.post('/', verifyToken, (req, res) => {
    // console.log('Blog: 1', req.files)
    upload(req, res, function (err) {
        console.log("req", req.body)
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        const { title, content, contentOutSide, link, isPublic } = req.body
        console.log('1:', title, content, contentOutSide, link, isPublic)
        console.log('2:', req.file)


        //Simple validation
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
            const newBlog = new Blog({
                image: req.file.filename,
                title,
                content,
                contentOutSide,
                link,
                isPublic,
            })
            newBlog.save()

            res.json({ success: true, message: 'Add Blog Seccess!' })

        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: 'Internal server error' })
        }
    })

})


// Update blog
router.put('/', verifyToken, async (req, res) => {
    if (req.body.imgUpdate === false) {
        console.log('imgUpdate none')
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
            let updateBlog = {
                title,
                content,
                contentOutSide,
                link,
                isPublic,
            }
            const _id = { _id: id }

            updateBlog = await Blog.findOneAndUpdate(_id, updateBlog)
            // User not authorised to update post or post not found
            if (!updateBlog)
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
                let updateBlog = {
                    image: images,
                    title,
                    content,
                    contentOutSide,
                    link,
                    isPublic,
                }
                console.log(updateBlog)
                const reqPath = path.join(__dirname, '../')
                fs.unlink(reqPath + "/assets/blogImages/" + imgOld, function (err) {
                    if (err) return console.log(err);
                });

                const _id = { _id: id }
                console.log('ID:', _id)
                updateBlog = await Blog.findOneAndUpdate(_id, updateBlog)

                // User not authorised to update post or post not found
                if (!updateBlog)
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

// Delete Blog
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const reqPath = path.join(__dirname, '../')
        const _id = { _id: req.params.id }
        console.log('id:', _id)
        const deletedBlog = await Blog.findOneAndDelete(_id)
        fs.unlink(reqPath + "/assets/blogImages/" + deletedBlog.name, function (err) {
            return res.status(401).json({ success: false, message: 'Image Not Found!' })
        });
        if (!deletedBlog)
            return res.status(401).json({
                success: false,
                message: 'Server Error'
            })
        res.setHeader('Content-Type', 'text/plain');
        res.json({ success: true, message: 'Delete Product Seccess!', post: deletedBlog })
    } catch (error) {
        console.log(error)
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

module.exports = router
