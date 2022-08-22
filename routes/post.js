const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

// const Post = require('../models/Post')
// const Products = require('../models/Product')
const Blog = require('../models/blog')
const Service = require('../models/service')

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
