

const mongoose = require("mongoose");



const orderSchema =
new mongoose.Schema({

    customerName:{
        type:String
    },

    customerPhone:{
        type:String
    },

    customerAddress:{
        type:String
    },

    productName:{
        type:String
    },

    productPrice:{
        type:Number
    },

    productImage:{
        type:String
    },

    productSize:{
        type:String
    },

    userEmail:{
        type:String
    },

    status:{
        type:String,

        default:"Pending"
    }

});



module.exports =
mongoose.model(

    "Order",

    orderSchema

);