import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'//Import the variables from .env file
import productRouter from './routes/productRoutes.js'
import orderRouter from './routes/orderRoutes.js'
import authRouter from './routes/authRoutes.js'
import reviewRouter from './routes/reviewRoutes.js'
import paymentRouter from './routes/paymentRoutes.js'
import webhookRouter from './routes/webhookRoutes.js'
import cartRouter from './routes/cartRoutes.js'
import { authLimiter, paymentLimiter, generalLimiter } from './middlewares/rateLimiters.js'
import cors from 'cors'


const app = express();//Make a server structure
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors());

app.use('/api/webhook', webhookRouter);
app.use(express.json());//Use the middleware in the server -> json package opener


//Handle the requests here which comes through various routes
app.use('/api/products', generalLimiter, productRouter);
app.use('/api/orders', generalLimiter, orderRouter);
app.use('/api/users', authLimiter, authRouter);
app.use('/api/reviews', generalLimiter, reviewRouter);
app.use('/api/payment', paymentLimiter, paymentRouter);
app.use('/api/cart', generalLimiter, cartRouter);






mongoose.connect(MONGO_URL).then(() => {
    console.log("Database is successfully connected to the server !");

    app.listen(PORT, () => {
        console.log(`The server is running on the PORT : ${PORT}`);
    })
}).catch((error) => {
     console.error("There's some error connecting to the database :", error);
})

