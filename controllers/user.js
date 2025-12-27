import User from '../models/userSchema.js'

export const findUserById = async (req,res) => {
try{
    const id = req.params.id;

    if(req.user.role === 'Customer' && req.user.id != id){//Important security check
        return res.status(403).json({message : 'You are not allowed to perform this action.'});
    }

    const user = await User.findById(id).select('-password -__v');

    if(!user){
        return res.status(404).json({message : 'User not found'});
    }

   return res.status(200).json({
   message: 'User details fetched successfully.',
   user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
 });

}catch(error){
    if(error.name == 'CastError'){
        return res.status(400).json({message : 'Data is provided in the invalid format.'});
    }

    return res.status(500).json({message : 'Internal server error'});
}
}