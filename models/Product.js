import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
	name: { type: String, required: true },
	price: { type: Number, required: true },
	description: { type: String, required: true },
	image: { type: String, required: true }, // Путь к изображению
	status: {
		type: String,
		enum: ['available', 'inProduction'],
		default: 'available',
	},
})

const Product = mongoose.model('Product', ProductSchema)

export default Product // Экспорт модели
