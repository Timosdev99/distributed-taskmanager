import "dotenv/config"
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { usermodel } from "../MODELS/users";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"


const app = express()
app.use(cookieParser())
app.use(express.json())


const generateCookies = (userId: string) => {
     const secretkey: any = process.env.SECRET_KEY
     const token = jwt.sign(userId, secretkey, {
        expiresIn: "1h"
     } )
}


export const signUp = async (req: Request, res: Response) => {
    try {
        
const {name, email, role, password} = req.body
    
if(!name || !email || !password) {
    res.status(400).json({message: "required feild missing"});
    return
}


const existinguser = await usermodel.findOne({email})
if(existinguser) {
    res.status(400).json({message: "email as been used already"})
    return
}

const user = new usermodel({
    name,
     email,
      role,
     password
})

    await user.save();
    res.status(201).json({message: "user created succesfully", 
        user
    })
    return
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "unable to create user"})
    }
}

export const login = async (req: Request, res: Response) => {
    try {
           const {email, password} = req.body
           if(!email || !password) {
            res.status(400).json({message: "email and password required"});
            return
           }

           const user = await usermodel.findOne({ email }).select('+password');
           if (!user) {
            res.status(400).json({message: "user those not exist"})
           }
     
           const checkpass = bcrypt.compare(password, user?.password as string)
           if(password !== checkpass) {
           let attempt = user?.loginAttempts as number 
           attempt++
           if (attempt >= 5) {
           let locked =  user?.lockUntil as unknown as number
           locked = Date.now() + 15 * 60 * 1000;
           }
   
           if (user) {
            await user.save();
          } else {
            throw new Error("User not found");
          }
          res.status(423).json({message: "incorrect password or email"})
           return

           } 

           let attempt = user?.loginAttempts as number 
           attempt = 0
           let locked =  user?.lockUntil as unknown as any
           locked = undefined
           if (user) {
            await user.save();
          } else {
            throw new Error("User not found");
          }
       
           const token = generateCookies(user.id);
       
           res.status(200).json({
             status: 'success',
             token,
             data: {
               user: {
                 id: user._id,
                 username: user.name,
                 email: user.email,
               },
             },
           });

    } catch (error) {
         console.log(error)
         res.status(500).json({message: "failed to login"})
    }
}

