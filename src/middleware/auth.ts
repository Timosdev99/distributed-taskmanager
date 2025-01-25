import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { usermodel } from "../MODELS/users";

export const authToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: string = req.cookies.token
        if (!token) {
            res.status(404).json({message: "no token found for authorization"})
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY as any)
       const user = usermodel.findById(decoded)
       if(!user){
        res.status(401).json({message: "no user found"})
       }
      // req.user = user 
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "auth failure" });
    }

}
