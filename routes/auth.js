const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, email, password: hashedPassword });
        const savedUser = await newUser.save();
        res.status(200).json(savedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        
        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }
        
        const match = await bcrypt.compare(req.body.password, user.password);
        
        if (!match) {
            return res.status(401).json({ error: "Wrong credentials!" });
        }
        
        const token = jwt.sign(
            { _id: user._id, username: user.username, email: user.email },
            process.env.SECRET,
            { expiresIn: "3d" }
        );
        
        const { password, ...info } = user._doc;
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict" })
           .status(200)
           .json(info);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGOUT
router.get("/logout", (req, res) => {
    try {
        res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "strict" })
           .status(200)
           .send("User logged out successfully!");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// REFETCH USER
router.get("/refetch", (req, res) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    jwt.verify(token, process.env.SECRET, (err, data) => {
        if (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
        res.status(200).json(data);
    });
});

module.exports = router;
