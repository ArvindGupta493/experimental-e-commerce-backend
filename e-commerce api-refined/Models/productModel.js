const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProductSchema = new Schema({
    name:        { type: String, required: [true, "Product name is required"], trim: true },
    description: { type: String, required: [true, "Product description is required"], trim: true },
    price:       { type: Number, required: [true, "Product price is required"], min: [0, "Price must be a positive number"] },
    category:    { type: String, required: [true, "Product category is required"] },
    stock:       { type: Number, required: [true, "Product stock is required"], min: [0, "Stock must be a positive number"] },
    image: {
        type: String,                     // URL to the product image
        default: "default-image-url.png", // Placeholder image
    },
}, { timestamps: true } );

module.exports = mongoose.model("Product", ProductSchema);
