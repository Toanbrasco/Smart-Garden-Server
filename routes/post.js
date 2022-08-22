const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

// const Post = require('../models/Post')
// const Products = require('../models/Product')
const Blog = require('../models/blog')
const Service = require('../models/service')
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
	return str
}
// Get Blog
router.get('/blog', async (req, res) => {
	const page = parseInt(req.query.page)
	const limit = parseInt(req.query.limit)

	const blogs = await Blog.find()
	const startIndex = (page - 1) * limit
	const endIndex = page * limit

	const totalPage = Math.ceil(blogs.length / limit)
	try {
		let results = []
		if (limit === 0 && page === 0) {
			results = blogs
		} else {
			results = blogs.slice(startIndex, endIndex)
		}
		res.json({
			success: true,
			pagination:
			{
				page: page,
				limit: limit,
				totalPage: totalPage
			},
			data: results
		})
	} catch (error) {
		console.log(error)
		res.json({ success: false, message: 'Internal server error' })
	}
})
// Blog Search

router.get('/blog/search', async (req, res) => {
	const searchText = req.query.searchtext
	const page = req.query.page
	const limit = req.query.limit

	const startIndex = (page - 1) * limit
	const endIndex = page * limit
	const blogs = await Blog.find()

	const Blogs = blogs.filter((item) => {
		let reg = new RegExp(searchText, "ig");
		return item.title.match(reg) != null
	})
	const totalPage = Math.ceil(Blogs.length / limit)
	const results = Blogs.slice(startIndex, endIndex)
	try {
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

// Blog Detail
router.get('/blog/detail', async (req, res) => {
	const detail = req.query.detail
	const blogs = await Blog.find()
	const Blogs = blogs.filter((item) => { return convertViToEn(item.title) === detail })

	// console.log(`productCategory`, productCategory.length, `newCategory`, newCategory.length, 'totalPage', totalPage, 'numRandom', numRandom, 'startIndex', startIndex, 'endIndex', endIndex)
	try {
		res.json({
			success: true,
			data: Blogs
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})
// Service Detail
router.get('/service/detail', async (req, res) => {
	const detail = req.query.detail
	const services = await Service.find()
	const Services = services.filter((item) => { return convertViToEn(item.title) === detail })

	// console.log(`productCategory`, productCategory.length, `newCategory`, newCategory.length, 'totalPage', totalPage, 'numRandom', numRandom, 'startIndex', startIndex, 'endIndex', endIndex)
	try {
		res.json({
			success: true,
			data: Services
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

// Get Service
router.get('/service', async (req, res) => {
	const page = parseInt(req.query.page)
	const limit = parseInt(req.query.limit)

	const services = await Service.find()
	const startIndex = (page - 1) * limit
	const endIndex = page * limit

	const totalPage = Math.ceil(services.length / limit)
	try {
		let results = []
		if (limit === 0 && page === 0) {
			results = services
		} else {
			results = services.slice(startIndex, endIndex)
		}
		res.json({
			success: true,
			pagination:
			{
				page: page,
				limit: limit,
				totalPage: totalPage
			},
			data: results
		})
	} catch (error) {
		console.log(error)
		res.json({ success: false, message: 'Internal server error' })
	}
})
// Service Search
router.get('/service/search', async (req, res) => {
	const searchText = req.query.searchtext
	const page = req.query.page
	const limit = req.query.limit

	const startIndex = (page - 1) * limit
	const endIndex = page * limit
	const services = await Service.find()

	const Services = services.filter((item) => {
		let reg = new RegExp(searchText, "ig");
		return item.title.match(reg) != null
	})
	const totalPage = Math.ceil(Services.length / limit)
	const results = Services.slice(startIndex, endIndex)
	try {
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

// @route POST api/posts
// @desc Create post
// @access Private
router.post('/', verifyToken, async (req, res) => {
	const { name, description, price, showItem, detailInfor, category } = req.body
	// Simple validation
	if (!name)
		return res
			.status(400)
			.json({ success: false, message: 'Title is required' })
	if (!category)
		return res
			.status(400)
			.json({ success: false, message: 'Category is required' })

	try {
		const newProducts = new Products({
			images: ['https://via.placeholder.com/500x500.png/09f/fffC/O',
				'https://via.placeholder.com/500x500.png/09f/fffC/O'],
			name,
			description,
			price,
			showItem,
			detailInfor: { ...detailInfor, "name": name },
			category,
		})
		await newProducts.save()

		res.json({ success: true, message: 'Add Product Seccess!', post: newProducts })
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

// @route PUT api/posts
// @desc Update post
// @access Private
router.put('/:id', verifyToken, async (req, res) => {
	const { name, images, description, price, showItem, detailInfor, category } = req.body

	// Simple validation
	if (!name)
		return res
			.status(400)
			.json({ success: false, message: 'Title is required' })
	if (!category)
		return res
			.status(400)
			.json({ success: false, message: 'Category is required' })

	try {
		let updateProduct = {
			images: [...images],
			name,
			description,
			price,
			showItem,
			detailInfor: { ...detailInfor },
			category,
		}
		console.log(updateProduct)
		const id = { _id: req.params.id }

		updateProduct = await Products.findOneAndUpdate(id,
			updateProduct
			// { new: true }
		)

		// User not authorised to update post or post not found
		if (!updateProduct)
			return res.status(401).json({
				success: false,
				message: 'Server Error'
			})

		res.json({
			success: true,
			message: 'Excellent progress!',
			post: updateProduct
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

// @route DELETE api/posts
// @desc Delete post
// @access Private
router.delete('/:id', verifyToken, async (req, res) => {
	try {
		const _id = { _id: req.params.id }
		console.log('id:', _id)
		const deletedProduct = await Products.findOneAndDelete(_id)
		console.log(deletedProduct)
		// User not authorised or post not found
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
