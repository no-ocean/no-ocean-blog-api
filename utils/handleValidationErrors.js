import {validationResult} from "express-validator";

// middleware for parse. check incoming fields on validity
export default (req, res, next) => {
    // check incoming fields on validity
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

    next();
}