require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const authRouter = require('./routes/auth')
const postRouter = require('./routes/post')
const productsRouter = require('./routes/product')
const imagesRouter = require('./routes/images')
const blogsRouter = require('./routes/blog')
const servicesRouter = require('./routes/service')
const configRouter = require('./routes/config')
const orderRouter = require('./routes/order')

const urlLocal = 'mongodb://127.0.0.1:27017/SmartGarden'

const urlWeb = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.vb0x9x6.mongodb.net/?retryWrites=true&w=majority`
// mongodb+srv://admin:<password>@cluster0.6q3f4ec.mongodb.net/?retryWrites=true&w=majority

const connectDB = async () => {
	try {
		await mongoose.connect(urlWeb,
			{
				useCreateIndex: true,
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false
			}
		)
		console.log('MongoDB connected')
	} catch (error) {
		console.log(error.message)
		process.exit(1)
	}
}

connectDB()

const app = express()
app.use(express.json())
app.use(cors())

app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)
app.use('/api/products', productsRouter)
app.use('/api/order', orderRouter)
// app.use('/api/blogs', blogsRouter)
// app.use('/api/services', servicesRouter)
app.use('/image', imagesRouter)
app.use('/api/config', configRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
