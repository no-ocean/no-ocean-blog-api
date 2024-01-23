import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import { loginValidation, postCreateValidation, registerValidation } from './validations/validations.js';
import { PostController, UserController } from './controllers/index.js';
import { checkAuth, handleValidationErrors} from './utils/index.js';
import { config } from 'dotenv';

const processENV = config().parsed;
const uri = processENV.MONGODB_URI;

mongoose
    .connect(uri)
    .then(() => console.log('DB connect OK'))
    .catch((err) => console.log('DB Error', err));

const app = express();

// create storage for files using multer
// think to make here delete spaces in filename
const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads')
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

app.use(express.json());

// add cors unblocker
app.use(cors());

// learn express to get files from /uploads
app.use('/uploads', express.static('uploads'));

// REGISTRATION
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);

// AUTHORIZATION
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);

// GET SELF INFO
app.get('/auth/me', checkAuth, UserController.getMe);

// POSTS
// get all posts
app.get('/posts', PostController.getAll);

// get post tags
app.get('/posts/tags', PostController.getLastTags);

// get tags
app.get('/tags', PostController.getLastTags);

// get one post
app.get('/posts/:id', PostController.getOne);

// create post
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);

// delete post
app.delete('/posts/:id', checkAuth, PostController.remove);

// update post
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update);

// upload images
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    })
});

// SET PORT LISTENER
app.listen(processENV.PORT || 4444, (err) => {
    if (err) {
        return console.log(err);
    }

    console.log('Server OK');
})