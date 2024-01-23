import bcrypt from "bcrypt";
import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";
import { config } from 'dotenv';

const processENV = config().parsed;

// registration
export const register = async (req, res) => {
    try {
        // create crypted password
        const pass = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(pass, salt);

        // create doc with user model
        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            password: passwordHash
        });

        // create user in mongoDB
        const user = await doc.save();

        // create token
        const token = jwt.sign(
            {
                _id: user._id
            },
          process.env["SECRET"] || processENV.SECRET,
            {
                expiresIn: '30d'
            }
        );

        // remove password from response
        const { password, ...userData} = user._doc;
        // return user
        res.json({...userData, token});
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось зарегестрироваться'
        });
    }
}

// authorization
export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });

        // check if user in database
        if (!user) {
            // return message without details because of security
            return res.status(400).json({
                message: 'Неверный логин или пароль',
            });
        }

        // check is input password the same with password in base
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.password);

        if (!isValidPass) {
            // return message without details because of security
            return res.status(400).json({
                message: 'Неверный логин или пароль',
            });
        }

        // if everything is good

        // create token
        const token = jwt.sign(
            {
                _id: user._id
            },
          process.env["SECRET"] || processENV.SECRET,
            {
                expiresIn: '30d'
            }
        );

        // remove password from response
        const { password, ...userData} = user._doc;
        // return user
        res.json({...userData, token});
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось авторизоваться'
        });
    }
}

// get self info
export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);

        // if auth ok but by chance can't find user by id
        if(!user) {
            return res.status(404).json({
                message: 'Пользователь не найден'
            });
        }

        // if everything is ok - return current user data
        // remove password from response
        const { password, ...userData} = user._doc;
        // return user data
        res.json(userData);
    } catch (err) {
        console.log(err);
        res.status(403).json({
            message: 'Нет доступа'
        });
    }
}