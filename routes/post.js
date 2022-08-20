const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

const Post = require('../models/Post')
const Products = require('../models/Product')

// @route GET api/posts
// @desc Get posts
// @access Private
router.get('/', verifyToken, async (req, res) => {
	try {
		const posts = await Post.find({ user: req.userId }).populate('user', [
			'username'
		])
		res.json({ success: true, posts })
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
