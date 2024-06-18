const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const postRoute = require('./routes/posts');
const commentRoute = require('./routes/comments');

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database is connected successfully!");
    } catch (err) {
        console.log(err);
    }
}

// Middlewares
dotenv.config();
app.use(express.json());

// Ensure the 'images' directory exists
const imagesPath = path.join(__dirname, "/images");
app.use("/images", express.static(imagesPath));

app.use(cors({
    //origin: "https://blogtest207.netlify.app",
    origin: process.env.FRONTEND,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);

// Image upload
const storage = multer.diskStorage({
    destination: (req, file, fn) => {
        fn(null, imagesPath); // Ensure this matches your static path
    },
    filename: (req, file, fn) => {
        fn(null, req.body.img); // Ensure img is provided in the request body
        }
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
    // console.log(req.body)
    res.status(200).json("Image has been uploaded successfully!");
});

app.listen(process.env.PORT, () => {
    connectDB();
    console.log("App is running on port " + process.env.PORT);
});
