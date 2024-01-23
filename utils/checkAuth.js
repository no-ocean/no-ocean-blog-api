import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

const processENV = config().parsed;

// middleware for checking authorize or not
export default (req, res, next) => {
    // parse token
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

    if (token) {
        try {
            const decoded = jwt.verify(token, processENV.SECRET);
            req.userId = decoded._id;

            next();
        } catch (err) {
            return res.status(403).json({
                message: "Нет доступа"
            });
        }
    } else {
        return res.status(403).json({
            message: "Нет доступа"
        });
    }
}