// require("dotenv").config();

// const PORT = process.env.PORT || 5000;
// const multer = require("multer");
// const cloudinary = require("./config/cloudinary");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// // const path = require("path");

// const express = require("express");

// const mongoose = require("mongoose");

// const cors = require("cors");

// const Order = require("./models/Order");

// const Product = require("./models/Product");

// const userRoutes = require("./routes/userRoutes");

// const app = express();


// // IMAGE STORAGE

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "shopx-products",
//     allowed_formats: ["jpg", "jpeg", "png", "webp"],
//   },
// });

// const upload = multer({ storage });


// // STATIC FOLDER


// // MIDDLEWARE
// app.use(cors());

// app.use(express.json());

// app.use("/api/users", userRoutes);




// // MONGODB CONNECT
// mongoose.connect(process.env.MONGO_URI)

// .then(() => {

//     console.log("MongoDB Connected");

// })

// .catch((error) => {

//     console.log(error);

// });

// // catch (error) {
// //     console.error("ERROR:", error);
// //     res.status(500).json({
// //         success: false,
// //         message: error.message,
// //         stack: error.stack
// //     });
// // }


// // TEST ROUTE
// app.get("/", (req,res) => {

//     res.send("ShopX Backend Running");

// });



// // SAVE ORDER API
// app.post("/orders", async (req,res) => {
//     const price = Number(req.body.productPrice);

// const discount = Math.round(price * 0.20);

// const deliveryCharge = 49;

// const totalAmount = price - discount + deliveryCharge;

//     try{

//         const newOrder = new Order({

//     customerName:req.body.customerName,

//     customerPhone:req.body.customerPhone,

//     customerAddress:req.body.customerAddress,

//     paymentMethod:req.body.paymentMethod,

//     productName:req.body.productName,

//     productPrice:price,

//     productImage:req.body.productImage,

//     productSize:req.body.productSize,

//     userEmail:req.body.userEmail,

//     description:req.body.description,

//     discount,

//     deliveryCharge,

//     totalAmount

// });



//         // SAVE ORDER
//         await newOrder.save();



//         res.status(201).json({

//             message:"Order Saved Successfully"

//         });

//     }

//     // catch(error){

//     //     console.log(error);

//     catch (error) {
//     console.error("ERROR:", error);
//     res.status(500).json({
//         success: false,
//         message: error.message,
//         stack: error.stack
//     });
// }



//         res.status(500).json({

//             message:"Server Error"

//         });

// });



// // GET ALL ORDERS
// app.get("/orders", async (req,res) => {

//     try{

//         const orders =
//         await Order.find();



//         res.json(orders);

//     }

//     // catch(error){

//     //     console.log(error);

//     // }

//     catch (error) {
//     console.error("ERROR:", error);
//     res.status(500).json({
//         success: false,
//         message: error.message,
//         stack: error.stack
//     });
// }

// });



// // DELETE ORDER
// app.delete("/orders/:id",
// async (req,res) => {

//     try{

//         await Order.findByIdAndDelete(
//             req.params.id
//         );



//         res.json({

//             message:"Order Deleted"

//         });

//     }

//     // catch(error){

//     //     console.log(error);

//     // }

//     catch (error) {
//     console.error("ERROR:", error);
//     res.status(500).json({
//         success: false,
//         message: error.message,
//         stack: error.stack
//     });
// }

// });


// // ADD PRODUCT

// // ADD PRODUCT

// app.post("/products", upload.single("image"), async (req, res) => {
//   try {

//     console.log("BODY:", req.body);
//     console.log("FILE:", req.file);

//     if (!req.file) {
//       return res.status(400).json({
//         message: "Image upload failed"
//       });
//     }

//     const newProduct = new Product({
//       name: req.body.name,
//       price: req.body.price,
//       category: req.body.category,
//       description: req.body.description,
//       image: req.file.path
//     });

//     await newProduct.save();

//     res.json({
//       message: "Product Added Successfully"
//     });

//   } catch (error) {

//     console.error("PRODUCT ERROR:", error);

//     res.status(500).json({
//       message: error.message
//     });
//   }
// });
// // UPDATE PRODUCT

// // UPDATE PRODUCT

// app.put(

// "/products/:id",

// upload.single("image"),

// async (req,res) => {

//     try{

//         const product =
//         await Product.findById(

//             req.params.id

//         );



//         // OLD IMAGE
//         let imagePath =
//         product.image;



//         // NEW IMAGE
//         if(req.file){

//           imagePath = req.file.path;  

//         }



//         await Product.findByIdAndUpdate(

//             req.params.id,

//             {

//                 name:req.body.name,

//                 price:req.body.price,

//                 category:req.body.category,

//                 image:imagePath

//             }

//         );



//         res.json({

//             message:"Product Updated"

//         });

//     }

//     //catch(error){

//     //    console.log(error);

//    // }

//    catch (error) {
//     console.error("ERROR:", error);
//     res.status(500).json({
//         success: false,
//         message: error.message,
//         stack: error.stack
//     });
// }

// });



// // DELETE PRODUCT

// app.delete("/products/:id",
// async (req,res) => {

//     try{

//         await Product.findByIdAndDelete(

//             req.params.id

//         );



//         res.json({

//             message:"Product Deleted"

//         });

//     }

//     // catch(error){

//     //     console.log(error);

//     // }

//     catch (error) {
//     console.error("ERROR:", error);
//     res.status(500).json({
//         success: false,
//         message: error.message,
//         stack: error.stack
//     });
// }

// });


// // UPDATE ORDER STATUS

// app.put("/orders/:id",
// async (req,res) => {

//     try{

//         await Order.findByIdAndUpdate(

//             req.params.id,

//             {

//                 status:"Delivered"

//             }

//         );



//         res.json({

//             message:"Order Delivered"

//         });

//     }

//     // catch(error){

//     //     console.log(error);

//     // }

//     catch (error) {
//     console.error("ERROR:", error);
//     res.status(500).json({
//         success: false,
//         message: error.message,
//         stack: error.stack
//     });
// }

// });

// // START SERVER
// app.listen(PORT, () => {

//     console.log(`Server running on port ${PORT}`);

// });





require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");

const cloudinary = require("./config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const Order = require("./models/Order");
const Product = require("./models/Product");
const userRoutes = require("./routes/userRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

/* ===========================
   CLOUDINARY STORAGE
=========================== */

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "shopx-products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: Date.now().toString(),
  }),
});

const upload = multer({ storage });

/* ===========================
   MIDDLEWARE
=========================== */

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);

/* ===========================
   MONGODB
=========================== */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error(err);
  });

/* ===========================
   HOME
=========================== */

app.get("/", (req, res) => {
  res.send("ShopX Backend Running");
});



/* ===========================
   SAVE ORDER
=========================== */

app.post("/orders", async (req, res) => {
  try {
    const price = Number(req.body.productPrice);

    const discount = Math.round(price * 0.2);
    const deliveryCharge = 49;
    const totalAmount = price - discount + deliveryCharge;

    const newOrder = new Order({
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      customerAddress: req.body.customerAddress,
      paymentMethod: req.body.paymentMethod,

      productName: req.body.productName,
      productPrice: price,
      productImage: req.body.productImage,
      productSize: req.body.productSize,

      userEmail: req.body.userEmail,
      description: req.body.description,

      discount,
      deliveryCharge,
      totalAmount,
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order Saved Successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/* ===========================
   GET ALL ORDERS
=========================== */

app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();

    res.json(orders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/* ===========================
   DELETE ORDER
=========================== */

app.delete("/orders/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);

    res.json({
      message: "Order Deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/* ===========================
   UPDATE ORDER STATUS
=========================== */

app.put("/orders/:id", async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, {
      status: "Delivered",
    });

    res.json({
      message: "Order Delivered",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});



/* ===========================
   ADD PRODUCT
=========================== */

app.post("/products", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image",
      });
    }

    const newProduct = new Product({
      name: req.body.name,
      price: Number(req.body.price),
      category: req.body.category,
      description: req.body.description,
      image: req.file.path, // Cloudinary URL
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product Added Successfully",
    });
  } 
  catch (error) {
    console.log("========== PRODUCT ERROR ==========");
    console.dir(error, { depth: null });

    console.log("Message:", error.message);
    console.log("Stack:", error.stack);

    res.status(500).json({
        success: false,
        message: error.message
    });
}
});

/* ===========================
   GET PRODUCTS
=========================== */

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/* ===========================
   UPDATE PRODUCT
=========================== */

app.put("/products/:id", upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    let image = product.image;

    if (req.file) {
      image = req.file.path;
    }

    await Product.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      price: Number(req.body.price),
      category: req.body.category,
      description: req.body.description,
      image,
    });

    res.json({
      message: "Product Updated Successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/* ===========================
   DELETE PRODUCT
=========================== */

app.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/* ===========================
   START SERVER
=========================== */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});