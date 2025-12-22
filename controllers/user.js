import User from '../models/userSchema.js'

export const findUserById = async (req,res) => {
try{
    const id = req.params.id;

    const user = await User.findOne({_id : id});

    if(!user){
        return res.status(404).json({message : 'User not found'});
    }

    return res.status(200).json({message : 'User details fetched successfully.', user});
}catch(error){
    if(error.name == 'CastError'){
        return res.status(400).json({message : 'Data is provided in the invalid format.'});
    }

    return res.status(500).json({message : 'Internal server error'});
}
}