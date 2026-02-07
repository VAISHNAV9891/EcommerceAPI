import User from '../models/userSchema.js'

export const findUserById = async (req,res) => {
try{
    const id = req.params.id;

    if(req.user.role === 'Customer' && req.user.id != id){//Important security check
        return res.status(403).json({message : 'You are not allowed to perform this action.'});
    }

    const user = await User.findOne({_id : id, isDeleted : false}).select('-password -__v');

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
    if(error.name === 'CastError'){
        return res.status(400).json({message : 'Data is provided in the invalid format.'});
    }

    return res.status(500).json({message : 'Internal server error'});
}
}

export const deleteUserById = async (req,res) => {//Always do soft delete -> means never delete the user from the database, just mark that user account as deleted !!!
    try{
        const userId = req.params.id;

        const user = await User.findById(userId);

        //Important check
        if(!user){
            return res.status(404).json({message : 'User not found, Please check the user id and try again.'});
        }

        //The user that is making this delete request to the server, can only delete "his" account -> so below there are some important checks for that verification
        if(req.user.id != userId){
            return res.status(403).json({message : 'You are not allowed to perform this action.'});
        }


        //Mark as deleted
        user.isDeleted = true;

        //Save the updated user in the database
        await user.save();

        //Send a response
        res.status(200).json({message : 'User deleted successfully.'});

    }catch(error){
        if(error.name === 'CastError'){
            return res.status(400).json({message : 'Data is provided in the invalid format.'});
        }
        return res.status(500).json({message : 'Internal server error'});
    }
}

export const getAllUsers = async (req, res) => {
    try{
        //Implementing the cursor based pagination to reduce the frontend load and to prevent the browser from crashing
        
        const limit = parseInt(req.query.limit) || 10;
        const cursor = req.query.cursor;

        const filter = {};

        if(cursor){
            filter = {_id : {$gt : cursor}, isDeleted : false};
        }

        const users = User.find(filter)
        .select('-password -__v')
        .sort({_id : 1})
        .limit(limit+1);

        if(users.length === 0){
            return res.status(404).json({message : 'No active users found after the given cursor'});
        }

        const nextCursor = (users.length == limit + 1)? users[users.length - 2]._id : null;
        if(users.length == limit + 1){
         users.pop();   
        }

        return res.status(200).json({message : 'Users fetched successfully', users, nextCursor : nextCursor});
        
    }catch(error){
        if(error.name == 'CastError'){
            return res.status(400).json({message : 'Data is provided in the invalid format.'});
        }
        return res.status(500).json({message : 'Internal Server Error'});
    }
}