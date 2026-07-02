const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    customerName: {
        type: String
    },

    customerPhone: {
        type: String
    },

    customerAddress: {
        type: String
    },

    productName: {
        type: String
    },

    productPrice: {
        type: Number
    },

    productImage: {
        type: String
    },

    productSize: {
        type: String
    },

    userEmail: {
        type: String
    },

    paymentMethod: {
        type: String
    },

    discount: {
        type: Number,
        default: 20
    },

    deliveryCharge: {
        type: Number,
        default: 49
    },

    totalAmount: {
        type: Number
    },

    status: {
        type: String,
        default: "Pending"
    }, // ✅ Yahan comma zaroor lagao

    description: {
        type: String
    }

});

module.exports = mongoose.model("Order", orderSchema);