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
//------------------------------------------------------------------------------
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

//------------------------------------------------------------------------------
// Blog Detail
router.get('/blog/:id', async (req, res) => {
	const id = req.query.id
	const blogs = await Blog.find({ _id: id })

	// console.log(`productCategory`, productCategory.length, `newCategory`, newCategory.length, 'totalPage', totalPage, 'numRandom', numRandom, 'startIndex', startIndex, 'endIndex', endIndex)
	try {
		res.json({
			success: true,
			data: blogs
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

// Service Detail
router.get('/service/:id', async (req, res) => {
	const id = req.query.id
	const services = await Service.find({ _id: id })

	// console.log(`productCategory`, productCategory.length, `newCategory`, newCategory.length, 'totalPage', totalPage, 'numRandom', numRandom, 'startIndex', startIndex, 'endIndex', endIndex)
	try {
		res.json({
			success: true,
			data: services
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

//------------------------------------------------------------------------------
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

//------------------------------------------------------------------------------
// Add Blog
router.post('/blog', verifyToken, async (req, res) => {
	const { title, desc, content, isPublic, image } = req.body
	console.log(`=>  req.body`, req.body)
	// Simple validation
	if (!title)
		return res.json({ success: false, message: 'Thiếu tên bài viết' })
	if (!desc)
		return res.json({ success: false, message: 'Thiếu mô tả bài viết' })

	try {
		const newBlog = new Blog({
			image,
			title,
			desc,
			content,
			isPublic
		})
		await newBlog.save()

		res.json({ success: true, message: 'Thêm bài viết thành công' })
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

// Add Service
router.post('/service', verifyToken, async (req, res) => {
	const { title, desc, content, isPublic, image } = req.body
	// Simple validation
	if (!title)
		return res.json({ success: false, message: 'Thiếu tên dịch vụ' })
	if (!desc)
		return res.json({ success: false, message: 'Thiếu mô tả dịch vụ' })

	try {
		const newService = new Service({
			images: image || [],
			title,
			desc,
			content,
			isPublic
		})
		await newService.save()

		res.json({ success: true, message: 'Thêm dịch vụ thành công' })
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

//------------------------------------------------------------------------------

// Update Blog
router.put('/blog', verifyToken, async (req, res) => {
	const { _id, title, image, desc, content, isPublic } = req.body
	console.log(`=> req.body`, req.body)

	// Simple validation
	if (!title)
		return res.json({ success: false, message: 'Thiếu tên bài viết' })

	try {
		let updateBlog = {
			image,
			title,
			desc,
			content,
			isPublic
		}
		const id = { _id: _id }

		const UpdateBlog = await Blog.findOneAndUpdate(id, updateBlog)

		// User not authorised to update post or post not found
		if (!UpdateBlog)
			return res.json({ success: false, message: 'Không tìm thấy bài viết' })

		res.json({ success: true, message: 'Cập nhật bài viết thành công' })
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})
// Update Service
router.put('/service', verifyToken, async (req, res) => {
	const { _id, title, image, desc, content, isPublic } = req.body

	// Simple validation
	if (!title)
		return res.json({ success: false, message: 'Thiếu tên dịch vụ' })

	try {
		let updateService = {
			image,
			title,
			desc,
			content,
			isPublic
		}
		const id = { _id: _id }

		const UpdateService = await Service.findOneAndUpdate(id, updateService)

		// User not authorised to update post or post not found
		if (!UpdateService)
			return res.json({ success: false, message: 'Không tìm thấy dịch vụ' })

		res.json({ success: true, message: 'Cập nhật dịch vụ thành công' })
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

//------------------------------------------------------------------------------
// Delete Blog
router.delete('/blog/:id', verifyToken, async (req, res) => {
	try {
		const id = { _id: req.params.id }
		const deleteBlog = await Blog.findOneAndDelete(id)
		// User not authorised or post not found
		if (!deleteBlog)
			return res.json({ success: false, message: 'Không tìm thấy bài viết cần xoá' })

		res.json({ success: true, message: 'Xoá bài viết thành công' })
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})
// Delete Service
router.delete('/service/:id', verifyToken, async (req, res) => {
	try {
		const id = { _id: req.params.id }
		const deleteService = await Service.findOneAndDelete(id)

		if (!deleteService)
			return res.json({ success: false, message: 'Không tìm thấy dịch vụ cần xoá' })

		res.json({ success: true, message: 'Xoá dịch vụ thành công' })
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

module.exports = router
