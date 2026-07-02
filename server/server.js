require("dotenv").config();

const PORT = process.env.PORT || 5000;
const multer = require("multer");

const path = require("path");

const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const Order = require("./models/Order");

const Product = require("./models/Product");

const userRoutes = require("./routes/userRoutes");

const app = express();


// IMAGE STORAGE

const storage = multer.diskStorage({

    destination:(req,file,cb) => {

        cb(null,"uploads/");
    },

    filename:(req,file,cb) => {

        cb(

            null,

            Date.now() +

            path.extname(file.originalname)

        );

    }

});



const upload = multer({

    storage
});



app.use(

    "/uploads",

    express.static("uploads")

);



// STATIC FOLDER


// MIDDLEWARE
app.use(cors());

app.use(express.json());

app.use("/api/users", userRoutes);




// MONGODB CONNECT
mongoose.connect(process.env.MONGO_URI)

.then(() => {

    console.log("MongoDB Connected");

})

.catch((error) => {

    console.log(error);

});



// TEST ROUTE
app.get("/", (req,res) => {

    res.send("ShopX Backend Running");

});



// SAVE ORDER API
app.post("/orders", async (req,res) => {
    const price = Number(req.body.productPrice);

const discount = Math.round(price * 0.20);

const deliveryCharge = 49;

const totalAmount = price - discount + deliveryCharge;

    try{

        const newOrder = new Order({

    customerName:req.body.customerName,

    customerPhone:req.body.customerPhone,

    customerAddress:req.body.customerAddress,

    paymentMethod:req.body.paymentMethod,

    productName:req.body.productName,

    productPrice:price,

    productImage:req.body.productImage,

    productSize:req.body.productSize,

    userEmail:req.body.userEmail,

    description:req.body.description,

    discount,

    deliveryCharge,

    totalAmount

});



        // SAVE ORDER
        await newOrder.save();



        res.status(201).json({

            message:"Order Saved Successfully"

        });

    }

    catch(error){

        console.log(error);



        res.status(500).json({

            message:"Server Error"

        });

    }

});



// GET ALL ORDERS
app.get("/orders", async (req,res) => {

    try{

        const orders =
        await Order.find();



        res.json(orders);

    }

    catch(error){

        console.log(error);

    }

});



// DELETE ORDER
app.delete("/orders/:id",
async (req,res) => {

    try{

        await Order.findByIdAndDelete(
            req.params.id
        );



        res.json({

            message:"Order Deleted"

        });

    }

    catch(error){

        console.log(error);

    }

});


// ADD PRODUCT

// ADD PRODUCT

app.post(

"/products",

upload.single("image"),

async (req,res) => {

    console.log(req.body);

    try{

       const newProduct = new Product({

    name:req.body.name,

    price:req.body.price,

    category:req.body.category,

    description:
    req.body.description,

    image:
    `http://localhost:5000/uploads/${req.file.filename}`

});



        await newProduct.save();



        res.json({

            message:"Product Added"

        });

    }

    catch(error){

        console.log(error);

    }

});

// GET PRODUCTS

app.get("/products", async (req,res) => {

    try{

        const products =
        await Product.find();



        res.json(products);

    }

    catch(error){

        console.log(error);

    }

});

// UPDATE PRODUCT

// UPDATE PRODUCT

app.put(

"/products/:id",

upload.single("image"),

async (req,res) => {

    try{

        const product =
        await Product.findById(

            req.params.id

        );



        // OLD IMAGE
        let imagePath =
        product.image;



        // NEW IMAGE
        if(req.file){

            imagePath =

            `http://localhost:5000/uploads/${req.file.filename}`;

        }



        await Product.findByIdAndUpdate(

            req.params.id,

            {

                name:req.body.name,

                price:req.body.price,

                category:req.body.category,

                image:imagePath

            }

        );



        res.json({

            message:"Product Updated"

        });

    }

    catch(error){

        console.log(error);

    }

});



// DELETE PRODUCT

app.delete("/products/:id",
async (req,res) => {

    try{

        await Product.findByIdAndDelete(

            req.params.id

        );



        res.json({

            message:"Product Deleted"

        });

    }

    catch(error){

        console.log(error);

    }

});


// UPDATE ORDER STATUS

app.put("/orders/:id",
async (req,res) => {

    try{

        await Order.findByIdAndUpdate(

            req.params.id,

            {

                status:"Delivered"

            }

        );



        res.json({

            message:"Order Delivered"

        });

    }

    catch(error){

        console.log(error);

    }

});

// START SERVER
app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});