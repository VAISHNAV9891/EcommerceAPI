import rateLimit from 'express-rate-limit';


export const authLimiter = rateLimit({//strict -> prevent users to create multiple dummy accounts from same IP or to save our server from brute-force login attack 
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Sirf 5 attempts allowed
    message: "Too many attempts, please try again after 15 minutes"
});

export const paymentLimiter = rateLimit({//for payment gateway -> very strict
    windowMs: 60 * 60 * 1000, // 1 Hour
    max: 5, // Sirf 5 payment attempts allowed per hour (Security ke liye)
    message: { message: "Too many payment requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

export const generalLimiter = rateLimit({//for cart,reviews,order,products
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests allowed (Browsing/Adding to cart ke liye kaafi hai)
    message: { message: "Too many requests, please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
});