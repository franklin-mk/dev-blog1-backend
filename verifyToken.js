const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    console.log("Token received:", token); // Add logging

    if (!token) {
        console.log("No token found in cookies"); // Add logging
        return res.status(401).json("You are not authenticated!");
    }

    jwt.verify(token, process.env.SECRET, (err, data) => {
        if (err) {
            console.error("Token verification failed:", err); // Add logging
            return res.status(403).json("Token is not valid!");
        }

        req.userId = data._id;
        console.log("Verification Passed", data); // Add logging
        next();
    });
};

module.exports = verifyToken;


/* 
const token = req.header('Authorization')
    if(!token) return res.status(401).json({success: false, message:'Access denied. Token not provided.'})

    jwt.verify(token.split(' ')[1], secretKey, (err, user) => {
        if(err) return res.status(401).json({success: false, message:'Access denied. Invalid token.'})
        req.user = user
        next()
    }) */