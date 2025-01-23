import "dotenv/config"
import {usermodel} from "../MODELS/users"
import { Request, Response } from "express"
import jwt from "jsonwebtoken"


// const generateJwt: string = (candidateId: string) => {
//        try {
//          const secretkey = process.env.SECRET_KEY as string
//         const token: string = jwt.sign( secretkey, candidateId, {expiresIn: 1000000000} )



//        } catch (error) {
//         console.log(error)
//        }
// }


