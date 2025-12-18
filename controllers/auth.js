import User from '../models/userSchema.js'
import Cart from '../models/cartSchema.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'//Import the variables from the .env file 




export const sign_up = async (req,res) => {
try{
    const {username,email,password} = req.body;
    //Check if all fields are present
    if(!username || !email || !password){
        return res.status(400).json({message : 'All fields are required'});        
    }

    if(password.length < 8){
        return res.status(400).json({message : 'Password must be 8 characters long'});
    }

    //Check if the user with the given email-id already Exists (email-id is acting as a primary key here)
    const existingUserEmail = await User.findOne({email : email});
    const existingUserUsername = await User.findOne({username : username});
    if(existingUserEmail){
        return res.status(400).json({message : 'Email already registered !!!'});
    }
    if(existingUserUsername){
        return res.status(400).json({message : 'Username not available !!!'})
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


    //Send a success response (Don't send the password back)
    res.status(201).json({ 
        message : 'Sign-up successful',
        user : {
           _id : newUser._id,
        username : newUser.username,
        email : newUser.email,
        role : newUser.role,
        cart : cart
        } 
    })

}catch(error) {
    if(error === 'CastError'){
        return res.send(404).json({message : 'Data is provided in the invalid format, change the format and try again !'});
    }
  return res.status(500).json({message : 'Internal server error', error : error.message});
}

}

export const login = async (req,res) => {
try {
    const {username,password,email} = req.body;
    //Validate the data
    if(!username && !email){
        return res.status(400).json({message : 'Username or Email is required'});
    }

    if(!password){
        return res.status(400).json({message : 'Password Cannot be empty'});
    }

    //Check if the user with given credentials exists or not.
    const user = await User.findOne({$or : [{username : username},{email : email}]});
    if(!user){
        return res.status(404).json({message : 'No user is associated with the given credentials, Please trying Signup !!!'});
    }

    //User exists with the given email/username -> if comparsion of passwords(HashedPasswords) become true -> log the user in else don't login the user as user has given wrong password !!!
    
    //Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        //Password doesn't match
        return res.status(401).json({message : 'Invalid credentials'});
    }

    //Password is correct , Login successful !!!!(This is where we generate the JWT Token and send it back to the frontend api) -> Kind of => given frontend api the permission, to show the web pages/app pages to the curent user, that a login user can see.
    //Create and sign the Json Web token (JWT)
    const token = jwt.sign(
        {id : user._id , role : user.role},//Payload -> Data that we have to store -> never store the password here due to security reasons
        process.env.JWT_SECRET_KEY,//Add the secret key from the .env file
        {expiresIn : process.env.JWT_EXPIRES_IN}//Declare the token expiration time
    )

    
     res.status(200).json({
            message: 'Login successful !',
            token: token,
            user: {
                _id: user._id,
                role: user.role,
                username: user.username,
                email: user.email,
                cart : user.cart
            }
        });




} catch(error){
    if(error === 'CastError'){
        return res.send(404).json({message : 'Data is provided in the invalid format, change the format and try again !'});
    }
    res.status(500).json({message : 'Internal server error',error : error.message});
}

}


export const googleCallback = (req, res) => {
  try {
    const user = req.user;

    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '3d',
    });

   
    res.status(200).json({
      success: true,
      message: "Google Login Successful",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

