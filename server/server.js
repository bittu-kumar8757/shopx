
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
app.use(

    "/uploads",

    express.static("uploads")

);

// MIDDLEWARE
app.use(cors());

app.use(express.json());

app.use("/api/users", userRoutes);

// PORT
const PORT = 5000;



// MONGODB CONNECT
mongoose.connect("mongodb://127.0.0.1:27017/shopx")

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

    try{

        const newOrder = new Order({

            customerName:
            req.body.customerName,

            customerPhone:
            req.body.customerPhone,

            customerAddress:
            req.body.customerAddress,

            productName:
            req.body.productName,

            productPrice:
            req.body.productPrice,

             productImage:
             req.body.productImage,

            productSize:
            req.body.productSize,

            userEmail:
            req.body.userEmail,

            description:
             req.body.description
            

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