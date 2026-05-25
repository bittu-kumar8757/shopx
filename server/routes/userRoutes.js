const express = require("express");

const router = express.Router();

const User = require("../models/User");



// SIGNUP API
router.post("/signup",
async (req,res) => {

    try{

        const {

            name,
            email,
            password

        } = req.body;



        // CHECK EMAIL
        const existingUser =
        await User.findOne({email});



        if(existingUser){

            return res.json({

                message:"User Already Exists"

            });

        }



        // CREATE USER
        const newUser = new User({

            name,
            email,
            password

        });



        await newUser.save();



        res.json({

            message:"Signup Successful"

        });

    }

    catch(error){

        console.log(error);

    }

});



// LOGIN API
router.post("/login",
async (req,res) => {

    try{

        const {

            email,
            password

        } = req.body;



        const user =
        await User.findOne({

            email,
            password

        });



        if(!user){

            return res.json({

                message:"Invalid Credentials"

            });

        }



        res.json({

            message:"Login Successful",

            user

        });

    }

    catch(error){

        console.log(error);

    }

});



module.exports = router;