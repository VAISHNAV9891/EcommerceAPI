import User from '../models/userSchema.js';
import Cart from '../models/cartSchema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendMailService } from '../services/mailServices.js';
import Token from '../models/tokenSchema.js';
import 'dotenv/config';//Import the variables from the .env file 
import validator from 'email-validator';
import crypto, { verify } from 'crypto';
import { authLimiter } from '../middlewares/rateLimiters.js';
import qrcode from 'qrcode';
import { generateSecret, generateURI, verifySync } from 'otplib';
import generateEmailOTP from '../services/otpServices.js';
import Otp from '../models/otpSchema.js';


export const sign_up = async (req,res) => {
try{
    const {username,email,password} = req.body;
    //Check if all fields are present
    if(!username || !email || !password){
        return res.status(400).json({message : 'All fields are required'});        
    }

    //Important check to ensure the email provided by the user is in valid "email" format
    if(!validator.validate(email)){
      return res.status(400).json({message : 'Email is provided in the invalid format'});
    }

    if(password.length < 8){
        return res.status(400).json({message : 'Password must be 8 characters long'});
    }

    //Check if the user with the given email-id already Exists (email-id is acting as a primary key here)
    const existingUserEmail = await User.findOne({email : email, isDeleted : false});
    const existingUserUsername = await User.findOne({username : username, isDeleted : false});
    if(existingUserEmail){
        return res.status(400).json({message : 'This email is already registered'});
    }
    if(existingUserUsername){
        return res.status(400).json({message : 'Username not available'})
    }

    //Now,it is guranteed that the current user trying to signing up, is the new user !!! => So, Please signup the user and store that credentials in your database for future verification
    
    //Now,Third Step is to hash the password
    const salt =  await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);



    //Create a new user in the database with the hashedPassword
    const newUser = await User.create({
        username : username,
        email : email,
        password : hashedPassword
    });

    //Eager creation
    //Create and Assign a Cart to this new user 
    const cart = await Cart.create({
        user : newUser._id
    })

    newUser.cart = cart._id;
    await newUser.save();

    //Generate a token
    const rawToken = crypto.randomBytes(32).toString('hex');

    //Hash the token
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    //Save the token in the database
    const tokenDoc = await Token.create({
      userId : newUser._id,
      tokenHash,
      purpose : 'EMAIL_VERIFY',
      expiresAt: Date.now() + 15 * 60 * 1000,
    })

    //Generate the link that we have to send to the user
    const domain = process.env.FRONTEND_URL || 'https://ecommerceapi-nh2j.onrender.com';
    const link   = `${domain}/api/auth/signup/verify-email/${rawToken}`;
    
    //Send the email using nodemailer
    const isSent = await sendMailService(link,newUser.email,'EMAIL_VERIFY');

    if(!isSent){
      return res.status(503).json({message : 'Cannot send mail,please try again later.'});
    }


    //Send a success response (Don't send the password back)
    res.status(201).json({ 
        message : 'Mail has been sent, please verify your email',
    })

}catch(error) {
    if(error.name === 'CastError'){
        return res.status(404).json({message : 'Data is provided in the invalid format, change the format and try again !'});
    }
  return res.status(500).json({message : 'Internal server error', error : error.message});
}

};

export const verifyEmail = async (req,res) => {
try{
  const rawToken = req.params.rawToken;
  //Hash the token
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  //Find the token document in the database
  const tokenDoc = await Token.findOne({
    tokenHash,
    purpose : 'EMAIL_VERIFY',
    expiresAt : {$gt : Date.now()},
    used : false
  });


    //Important check, so that we can discard every expired or invalid token
   if(!tokenDoc){
    return res.status(400).json({message : 'Invalid or expired token.'});
   }

   const user = await User.findByIdAndUpdate(tokenDoc.userId,{isVerified : true},{new : true});

   return res.status(201).json({
    message : 'User sign-up successful, you can now login to your account.',
     user : {
           _id : user._id,
        username : user.username,
        email : user.email,
        role : user.role,
        cart : user.cart
        }
   });


}catch(error){
  if(error.name === 'CastError'){
    return res.status(400).json({message : 'Data is provided in invalid format'});
  }

  return res.status(500).json({message : 'Internal Server Error'});
}
};

export const login = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 1. Validate Input
    if ((!username && !email) || !password) {
      return res.status(400).json({ 
        message: 'Email/Username and Password are required' 
      });
    }

    // 2. Dynamic Query Construction (Fixes the undefined bug)
    // We only search by fields that actually exist in the request
    const criteria = [];
    if (username) criteria.push({ username });
    if (email) criteria.push({ email });

    // If neither was provided, we can't search
    if (criteria.length === 0) {
      return res.status(400).json({ message: 'Username or Email is required' });
    }

    // 3. Find User
    const user = await User.findOne({ $or: criteria }).select('+password +isTwoFactorEnabled +twoFactorSecret');

    if (!user) {
      return res.status(404).json({ 
        message: 'No user found with these credentials.' 
      });
    }

      

      if(!user.isVerified){
      return res.status(400).json({message : 'You cannot perform this action.'});
      }

    

    
    // If user exists but has no password, they signed up via OAuth
    if (!user.password) {
      return res.status(400).json({ 
        message: 'This account uses Google Sign-In. Please login with Google.' 
      });
    }

    
   
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    //User validation successful, so now reset the rate-limiter counter for this user
    authLimiter.resetKey(req.ip);

    //if user's two factor is enabled then asks the user to hit the api route to verify the OTP
    //Later when we got the frontend in our web application then, we'll redirect the user to the "OTP Input" page and then that page has a button named "verify OTP", so when user clicks that button then it'll automatically hit the verify OTP route
    if(user.isTwoFactorEnabled && user.twoFactorType === 'APP'){
      return res.status(200).json({
        message : 'APP-Based Two-Factor Authentication required.',
        userId : user._id
      });
    }else if(user.isTwoFactorEnabled && user.twoFactorType === 'EMAIL'){
       //Generate Otp
       const otp = generateEmailOTP();

       //Hash the Otp
       const salt = await bcrypt.genSalt(10);
       const hashedOtp = await bcrypt.hash(otp,salt);
       
       //Save the Otp document in the database
       const otpDoc = await Otp.create({
        userId : user._id,
        otp : hashedOtp
       });

       //Send the otp to this user on the email
       const isSent = await sendMailService(otp,user.email,'TWO_FACTOR_AUTH');

       if(!isSent){
          return res.status(503).json({message : 'Cannot send mail,please try again later.'});
       }

       return res.status(200).json({message : 'OTP has been sended to the email.', userId : user._id});
    }


    //Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    //Success Response
    return res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: {
        _id: user._id,
        role: user.role,
        username: user.username,
        email: user.email,
        cart: user.cart
      }
    });

  } catch (error) {
    if(error.name === 'CastError') return res.status(400).json({message : 'Data is provided in invalid format'});
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email, username } = req.body;

    // Validation
    if (!email && !username)
      return res.status(400).json({ message: 'Email or username required' });

    if (email && !validator.validate(email))
      return res.status(400).json({ message: 'Invalid email format' });

    
    // Dynamically build the search criteria
    const criteria = [];
    if (email) criteria.push({ email });
    if (username) criteria.push({ username });

    // Find user using the clean criteria
    const user = await User.findOne({ $or: criteria });
    

    // Always return same response for security
    if (!user)
      return res.status(200).json({
        message: 'If the account exists, a reset email has been sent'
      });

    
    
    // Generate random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await Token.create({
      userId: user._id,
      tokenHash,
      purpose: 'RESET_PASSWORD',
      expiresAt: Date.now() + 15 * 60 * 1000
    });

    const domain = process.env.FRONTEND_URL || 'https://ecommerceapi-nh2j.onrender.com';
    const link = `${domain}/api/auth/reset-password/${rawToken}`;

    

    const isSent = await sendMailService(link, user.email, 'RESET_PASSWORD');

    if(!isSent){
      return res.status(503).json({message : 'Cannot send mail,please try again later.'});
    }

    return res.status(200).json({
      message: 'If the account exists, a reset email has been sent'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    //Validate fields
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Both fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    //Hash incoming token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    //Find token in DB
    const tokenDoc = await Token.findOne({
      tokenHash,
      purpose: 'RESET_PASSWORD',
      used: false,
      expiresAt: { $gt: Date.now() }
    });

    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    //Update password
    const user = await User.findById(tokenDoc.userId);
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(newPassword,salt);
    user.password = hashedPassword; // Save the hashed password in the database -> Best practice
    await user.save();

    //Mark token as used
    tokenDoc.used = true;
    await tokenDoc.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const enable2FA = async (req,res) => {
  try{
    const type = req.body.type;
    const userId = req.user.id;

    //Important check
    if(type !== 'EMAIL' && type !== 'APP'){
      return res.status(400).json({message : 'Invalid Two-Factor Authentication type,Change the type to valid values mentioned in the docs and try again.'});
    }

    const user = await User.findById(userId);

    //Important check
    if(user.isTwoFactorEnabled){
      return res.status(400).json({message : 'Two-Factor Authentication is already enabled.'});
    }

    if(type === 'EMAIL'){
      //Generate Otp
       const otp = generateEmailOTP();

       //Hash the Otp
       const salt = await bcrypt.genSalt(10);
       const hashedOtp = await bcrypt.hash(otp,salt);
       
       //Save the Otp document in the database
       const otpDoc = await Otp.create({
        userId : req.user.id,
        otp : hashedOtp
       });

       //Send the otp to this user on the email
       const isSent = await sendMailService(otp,user.email,'TWO_FACTOR_AUTH');

       if(!isSent){
          return res.status(503).json({message : 'Cannot send mail,please try again later.'});
       }

       return res.status(200).json({message : 'OTP has been sended to the email, Please verify the OTP to enable the Two-Factor authentication.', userId : user._id});
    }

    const secret = generateSecret();
    

    //Update the changes in the database
    user.twoFactorSecret = secret;
    await user.save();

    // Generate QR code URI for authenticator apps
    const uri = generateURI({
    issuer: "EcommerceBackendAPI",
    label: user.username,
    secret,
    });

    //Generate the actual scannable QR code image , which we send it as a backend response
    const qrCodeImage = await qrcode.toDataURL(uri);


    return res.status(200).json({
      message : 'QR code generated successfully',
      qrCodeImage
    });


  }catch(error){
    if(error.name == 'CastError') return res.status(400).json({message : 'Data is provided in invalid format.'});

    return res.status(500).json({message : 'Internal server error'});
  }
};

export const verifySetup = async (req,res) => {
  try{
    const { OTP,type } = req.body;
    const userId  = req.user.id;

    //Important check
    if(type !== 'EMAIL' && type !== 'APP'){
      return res.status(400).json({message : 'Invalid Two-Factor Authentication type,Change the type to valid values mentioned in the docs and try again.'});
    }

    //Fetch the user
    const user = await User.findById(userId).select('+twoFactorSecret +isTwoFactorEnabled');

    //Important check -> 1
    if(!user){
      return res.status(404).json({message : 'User not found.'});
    }

    //Important check -> 2
    if (user.isTwoFactorEnabled) {
      return res.status(400).json({message: 'Two-Factor Authentication is already enabled.'});
    }

    if(type === 'EMAIL'){
      const otpDoc = await Otp.findOne({
        userId : userId,
      });


      //Important check
      if(!otpDoc){
        return res.status(404).json({message : 'There is no active otp for this user in the database.'});
      }

      const isValidOtp = await bcrypt.compare(String(OTP),otpDoc.otp);

      if(!isValidOtp){
        return res.status(400).json({message : 'Invalid Otp'});
      }

      await Otp.deleteOne({ _id: otpDoc._id });

      

    
    }else if(type === 'APP'){
      //Check if the OTP is valid
    const isValid = verifySync({
      token: String(OTP),
      secret : user.twoFactorSecret
    });
    
    if(!isValid.valid){
      return res.status(400).json({message : 'Invalid OTP ! Please try again.'});
    }
    }


    
    

    //If our program control reaches here which means OTP given in the request body is valid
    user.isTwoFactorEnabled = true;
    user.twoFactorType = type;
    await user.save();

    if(type == 'APP'){
      return res.status(200).json({message : 'App-Based Two-Factor Authentication enabled successfully.'});
    }else if(type == 'EMAIL'){
      return res.status(200).json({message : 'Email-Based Two-Factor Authentication enabled successfully.'});
    }

    

  }catch(error){ 
    if(error.name == 'CastError') return res.status(400).json({message : 'Data is provided in the invalid format.'}); 
    console.log(error);
    return res.status(500).json({message : 'Internal Server Error'});
  }
};

export const verifyOTP = async (req,res) => {
try{
    const { OTP, userId } = req.body;

    //Fetch the user
    const user = await User.findById(userId).select('+twoFactorSecret +isTwoFactorEnabled');

    //Important check -> 1
    if(!user){
      return res.status(404).json({message : 'User not found'});
    }

    //Important check -> 2
    if(!user.isTwoFactorEnabled){
      return res.status(400).json({message : 'You cannot perform this action, as Two-Factor Authentication is not enabled.'});
    }

    //Email Otp verification branch
    if(user.twoFactorType === 'EMAIL'){
      
      const otpDoc = await Otp.findOne({
        userId : userId,
      })


      //Important check
      if(!otpDoc){
        return res.status(404).json({message : 'There is no active otp for this user in the database.'});
      }
      const isValidOtp = await bcrypt.compare(String(OTP),otpDoc.otp);

      if(!isValidOtp){
        return res.status(400).json({message : 'Invalid Otp'});
      }
      
      await Otp.deleteOne({ _id: otpDoc._id });

    //If control reaches here, then it confirms the fact that OTP given by user is valid


    }else if(user.twoFactorType === 'APP'){
    //Now check the OTP and if it is the valid OTP , then generate the JWT token and send it as the json response
    const isValid = verifySync({
      token : String(OTP),
      secret : user.twoFactorSecret
    });
    

    if(!isValid.valid){
      return res.status(400).json({message : 'Invalid OTP, Please try again.'});
    }
    }

    

    //OTP Validation successful so, now just Generate the JWT and send it as the JSON response
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    //Success Response
    return res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: {
        _id: user._id,
        role: user.role,
        username: user.username,
        email: user.email,
        cart: user.cart
      }
    });
   
}catch(error){
  if(error.name == 'CastError') return res.status(400).json({message : 'Data is provided in invalid format.'});

  return res.status(500).json({message : 'Internal Server Error'});
}
};



// //Generate a jwt token, and send that on the user email for verification
// export const forgetPassword = async (req,res) => {
// try{
// const unique = req.body;//This field can get either email or username

// if(unique.email){//Important validation check
//     const isValid = validator.validate(unique.email);
//     if(!isValid) return res.status(400).json({message : 'Email is not in valid format.'});
// }


// if(!unique.email && !unique.username){//Important check 
//     return res.status(400).json({message : 'This field cannot be empty'});
// }



// const user = await User.findOne({
//     $or : [{username : unique.username},{email : unique.email}]
// });


// if(!user){
//     return res.status(200).json({message : 'If account exists, then email is successfully sended on the registered email'});
// }

// //Make a JWT token
// const token = jwt.sign(
//     {_id : user._id, type: 'RESET_PASSWORD'},
//     process.env.JWT_SECRET_RESET,
//     {expiresIn : process.env.JWT_EXPIRES_IN_RESET}
// )

// //Make a link and embedded this token in the link
// const domain = `http://localhost:5000`;
// const link = `${domain}/api/auth/resetPasswordReq/${token}`;

// //Send the mail via nodemailer
// await sendMailService(link,user.email);

// return res.status(200).json({message : 'If account exists, then email is successfully sended on the registered email'});


// }catch(error){
// if(error.name === 'CastError'){
//     return res.status(400).json({message : 'Data is provided in the invalid format'});
// }
// return res.status(500).json({message : 'Internal Server Error'});
// }
// }


export const googleCallback = (req, res) => {
  try {
    const user = req.user;

    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '3d',
    });


   
    return res.status(200).json({
      success: true,
      message: "Google Login Successful",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

