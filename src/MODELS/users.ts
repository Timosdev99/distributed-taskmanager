
import { model, Schema } from "mongoose";
import  bcrypt from "bcrypt"

interface users {
    _id?: number, 
    name: string,
    email: string,
    password: string,
    otp: {
        code: string;
        expiresAt: Date;
    },
    lastPasswordReset: Date,
    loginAttempts: number,
    lockUntil: Date,
    joinedAt?: Date
}

const userschema = new Schema<users> ({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false,
      },
      otp: {
        code: String,
        expiresAt: Date,
      },
      lastPasswordReset: Date,
      loginAttempts: {
        type: Number,
        default: 0,
      },
      lockUntil: Date,
    }, {
      timestamps: true,
    });
    
   
    userschema.pre("save", async function(next) {
        if (!this.isModified('password')) return next();
    
        try {
            const salt = await bcrypt.genSalt(12);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch(error) {
            throw error;
        }
    });


    userschema.methods.comparePassword = async (candidatepassword: string) => {
       
   try {
   // const password: string = this.password;
// return bcrypt.compare(candidatepassword, password)
   }

   catch(error)  {
    throw error
   }
    }

    userschema.methods.isLocked = function() {
        return !!(this.lockUntil && this.lockUntil > Date.now());
      };



const usermodel = model<users>("users", userschema)

export default usermodel