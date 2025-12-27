import express from 'express'
import {tokenVerifier} from '../middlewares/verifyToken.js'
import {
findUserById,

} from '../controllers/user.js'

const userRouter = express.Router();



userRouter.get('/info/:id', tokenVerifier, findUserById);


export default userRouter;