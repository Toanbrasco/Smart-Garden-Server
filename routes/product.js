const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

const products = require("../models/Product.js");

const path = require('path')
const multer = require('multer')
const fs = require('fs')

const convertViToEn = (str, toUpperCase = false) => {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    str = str.replace(/\s/g, '-'); // Â, Ê, Ă, Ơ, Ư
    // console.log(str)
    return str.substring(1)
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/productImage')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer({ storage: storage }).array('file')
// array('multi-files')
// router.get('/', async (req, res) => { }
const sortProduct = (num, data) => {
    switch (num) {
        case 1:
            return data.sort((a, b) => Number(a.price.base) - Number(b.price.base))
        case 2:
            return data.sort((a, b) => Number(b.price.base) - Number(a.price.base))
        case 3:
            return data.sort((a, b) => Number(a.price.discount) - Number(b.price.discount))
        case 4:
            return data.sort((a, b) => Number(b.price.discount) - Number(a.price.discount))
        case 5:
            return data.sort((a, b) => a.name.toUpperCase() == b.name.toUpperCase() ? 0 : a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1)

        case 6:
            return data.sort((a, b) => a.name.toUpperCase() == b.name.toUpperCase() ? 0 : a.name.toUpperCase() > b.name.toUpperCase() ? -1 : 1)
        default:
            return data
            break;
    }
}
// Get All
router.get('/all', async (req, res) => {
    try {
        const results = await products.find()
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
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const sort = parseInt(req.query.sort)

    const pd = await products.find()
    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const totalPage = Math.ceil(pd.length / limit)
    const Product = await sortProduct(sort, pd)
    try {
        let results = []
        if (limit === 0 && page === 0) {
            results = Product
        } else {
            results = Product.slice(startIndex, endIndex)
        }
        // const results = await products.find().limit(limit).skip(startIndex).exec()
        res.json({
            success: true,
            pagination: {
                page: page,
                limit: limit,
                totalPage: totalPage
            },
            data: results
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})
// Get Products Random
router.get('/random', async (req, res) => {
    const limit = parseInt(req.query.random)

    const pd = await products.find()

    const totalPage = Math.ceil(pd.length / limit)
    const numRandom = Math.floor(Math.random() * (totalPage - 1) + 1)
    const startIndex = (numRandom - 1) * limit
    const endIndex = numRandom * limit
    try {
        const results = pd.slice(startIndex, endIndex)
        res.json({
            success: true,
            pagination: {
                page: numRandom,
                limit: limit,
                totalPage: totalPage
            },
            data: results
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// Get Category
router.get('/category', async (req, res) => {
    const category = req.query.category
    const page = req.query.page
    const limit = req.query.limit
    const sort = parseInt(req.query.sort)
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const pd = await products.find()

    let productCategory = []
    pd.forEach((item) => {
        if (item.category.detail.includes(category) || item.category.main.includes(category)) {
            productCategory.push(item)
        }
    });
    const totalPage = Math.ceil(productCategory.length / limit)
    const productSort = sortProduct(sort, productCategory)
    const results = productSort.slice(startIndex, endIndex)

    try {
        res.json({
            success: true,
            pagination: {
                page: page,
                limit: limit,
                totalPage: totalPage
            },
            length: productCategory.length,
            category: category,
            data: results
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})
// Get ItemDetail
router.get('/detail', async (req, res) => {
    const detail = req.query.detail
    const pd = await products.find()
    const product = pd.filter((item) => { return convertViToEn(item.name) === detail })

    const limit = 7
    let productCategory = []
    pd.forEach((item) => {
        if (item.category.main === product[0].category.main) {
            if (item._id !== product[0]._id) {
                productCategory.push(item)
            }
        }
    })

    const totalPage = Math.ceil(productCategory.length / limit)
    const numRandom = Math.floor(Math.random() * (totalPage - 1) + 1)
    const startIndex = (numRandom - 1) * limit
    const endIndex = numRandom * limit
    const newCategory = productCategory.slice(startIndex, endIndex)
    // console.log(`productCategory`, productCategory.length, `newCategory`, newCategory.length, 'totalPage', totalPage, 'numRandom', numRandom, 'startIndex', startIndex, 'endIndex', endIndex)

    try {
        res.json({
            success: true,
            data: product,
            data2: newCategory
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// Get Search
router.get('/search', async (req, res) => {
    const searchText = req.query.searchtext
    const page = req.query.page
    const limit = req.query.limit
    const sort = parseInt(req.query.sort)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const pd = await products.find()

    const product = pd.filter((item) => {
        let reg = new RegExp(searchText, "ig");
        return item.name.match(reg) != null
    })
    const productSort = sortProduct(sort, product)
    const totalPage = Math.ceil(product.length / limit)
    const results = productSort.slice(startIndex, endIndex)
    // if (!payload) return this.fruits;
    try {
        res.json({
            success: true,
            pagination: {
                page: page,
                limit: limit,
                totalPage: totalPage
            },
            searchText: searchText,
            length: product.length,
            data: results
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})


// Add
router.post('/', (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        const { name, link, description, price, isPublic, detailInfor, category } = req.body
        const list = []
        req.files.forEach(item => {
            list.push(item.filename)
        })
        if (!name)
            return res
                .status(400)
                .json({ success: false, message: 'Title is required' })
        if (!category)
            return res
                .status(400)
                .json({ success: false, message: 'Category is required' })

        try {
            const newProducts = new products({
                images: [...list],
                name,
                description,
                price,
                link,
                isPublic,
                detailInfor,
                category,
            })
            newProducts.save()

            res.json({ success: true, message: 'Add Product Seccess!', post: newProducts })
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: 'Internal server error' })
        }
    })
})

// Update
router.put('/', verifyToken, async (req, res) => {
    upload(req, res, async (err) => {
        console.log("router.put => req", req.body)
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        const { imgOld, id, name, link, detailInfor, isPublic, price, category, description } = req.body
        // Simple validation
        if (!name)
            return res
                .status(400)
                .json({ success: false, message: 'Name is required' })

        if (!description)
            return res
                .status(400)
                .json({ success: false, message: 'description is required' })

        if (!category)
            return res
                .status(400)
                .json({ success: false, message: 'category is required' })

        if (!link)
            return res
                .status(400)
                .json({ success: false, message: 'Link is required' })

        let list = []
        if (imgOld.length > 30) {
            list.push(imgOld)
        }
        else {
            list = [...list, ...imgOld]
        }
        req.files.forEach(item => {
            list.push(item.filename)
        })
        try {
            // console.log('img New', req.files)
            let updateProduct = {
                images: [...list],
                name,
                link,
                description,
                price,
                isPublic,
                detailInfor,
                category,
            }
            // console.log(imgOld.length)
            if (imgOld.length > 30) {
                const reqPath = path.join(__dirname, '../')
                fs.unlink(reqPath + "/assets/productImage/" + imgOld, function (err) {
                    if (err) return console.log(err);
                });
            }
            else {
                const reqPath = path.join(__dirname, '../')
                imgOld.forEach(item => {
                    fs.unlink(reqPath + "/assets/productImage/" + item, function (err) {
                        if (err) return console.log(err);
                    });
                })
            }


            const _id = { _id: id }
            console.log('ID:', _id)
            updateProduct = await products.findOneAndUpdate(_id, updateProduct)

            // User not authorised to update post or post not found
            if (!updateProduct)
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
            // const list = []
            // req.files.forEach(item => {
            //     list.push(item.filename)
            // })
            const reqPath = path.join(__dirname, '../')
            list.forEach(item => {
                fs.unlink(reqPath + "/assets/productImage/" + item, function (err) {
                    if (err) return console.log(err);
                });
            })
            res.status(500).json({ success: false, message: 'Internal server error' })
        }
    })
})

// Delete
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const _id = { _id: req.params.id }
        console.log('id:', _id)
        const deletedProduct = await products.findOneAndDelete(_id)
        const reqPath = path.join(__dirname, '../')
        deletedProduct.images.forEach(item => {
            fs.unlink(reqPath + "/assets/productImage/" + item, function (err) {
                if (err) return console.log(err);
            });
        })
        if (!deletedProduct)
            return res.status(401).json({
                success: false,
                message: 'Server Error'
            })

        res.json({ success: true, message: 'Delete Product Seccess!', post: deletedProduct })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

module.exports = router