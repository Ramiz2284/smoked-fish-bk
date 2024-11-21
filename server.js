import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import Product from './models/Product.js' // Убедитесь, что расширение указано

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Подключение к MongoDB
mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log('Подключено к MongoDB'))
	.catch(err => console.error('Ошибка подключения к MongoDB:', err))

// Настройка CORS
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/')
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`)
	},
})
const upload = multer({ storage })

// === Маршруты API ===

// Получить все товары
app.get('/api/products', async (req, res) => {
	try {
		const products = await Product.find()
		res.status(200).json(products)
	} catch (error) {
		res.status(500).json({ error: 'Ошибка при получении товаров' })
	}
})

// Добавить новый товар
app.post('/api/products', upload.single('image'), async (req, res) => {
	try {
		const { name, price, description, status } = req.body

		if (!req.file) {
			return res.status(400).json({ error: 'Фотография обязательна' })
		}

		const newProduct = new Product({
			name,
			price,
			description,
			image: `https://smokedfish.marketlistem.site/uploads/${req.file.filename}`,
			status,
		})

		const savedProduct = await newProduct.save()
		res.status(201).json(savedProduct)
	} catch (error) {
		res.status(500).json({ error: 'Ошибка при добавлении товара' })
	}
})

// Редактировать товар
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
	try {
		const { id } = req.params
		const { name, price, description, status } = req.body
		const updatedFields = { name, price, description, status }

		if (req.file) {
			updatedFields.image = `http://localhost:${PORT}/uploads/${req.file.filename}`
		}

		const updatedProduct = await Product.findByIdAndUpdate(id, updatedFields, {
			new: true,
		})
		if (!updatedProduct) {
			return res.status(404).json({ error: 'Товар не найден' })
		}

		res.status(200).json(updatedProduct)
	} catch (error) {
		res.status(500).json({ error: 'Ошибка при обновлении товара' })
	}
})

// Удалить товар
app.delete('/api/products/:id', async (req, res) => {
	try {
		const { id } = req.params
		await Product.findByIdAndDelete(id)
		res.status(200).json({ message: 'Товар удален' })
	} catch (error) {
		res.status(500).json({ error: 'Ошибка при удалении товара' })
	}
})

// Обновить статус товара
app.patch('/api/products/:id/status', async (req, res) => {
	try {
		const { id } = req.params
		const { status } = req.body

		if (!['available', 'inProduction'].includes(status)) {
			return res.status(400).json({ error: 'Недопустимый статус' })
		}

		const updatedProduct = await Product.findByIdAndUpdate(
			id,
			{ status },
			{ new: true }
		)

		if (!updatedProduct) {
			return res.status(404).json({ error: 'Товар не найден' })
		}

		res.status(200).json(updatedProduct)
	} catch (error) {
		res.status(500).json({ error: 'Ошибка при обновлении статуса' })
	}
})

// Статическая папка для загрузок
app.use('/uploads', express.static('uploads'))

// Запуск сервера
app.listen(PORT, () => {
	console.log(`Сервер запущен на http://localhost:${PORT}`)
})
