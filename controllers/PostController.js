import PostModel from '../models/post.js';

export const getAll = async (req, res) => {
    try {
        //.populate('user').exec() - relate to user table
        const posts = await PostModel.find().populate('user').exec();

        // here you (Me?) should cut user password and other info
        res.json(posts);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статьи'
        });
    }
}

export const getOne = async (req, res) => {
    try {
        const postID = req.params.id;

        const post = await PostModel.findOneAndUpdate({
            _id: postID,
        }, {
            $inc: { viewsCount: 1 },
        }, {
            new: true,
            upsert: true // Make this update into an upsert
        }).populate('user');

        // maybe is not necessary because if no id then works catch
        if (!post) {
            return res.status(404).json({
                message: "Статья не найдена"
            })
        }

        res.json(post);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статью'
        });
    }
}

export const remove = async (req, res) => {
    try {
        const postID = req.params.id;

        const post = await PostModel.findOneAndDelete({
            _id: postID
        });

        if (!post) {
            return res.status(404).json({
                message: 'Статья не найдена'
            })
        }

        res.json({
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статью'
        });
    }
}

export const create = async (req, res) => {
    try {
        const doc = new PostModel({
           title: req.body.title,
           text: req.body.text,
           imageUrl: req.body.imageUrl,
           tags: req.body.tags,
           user: req.userId,
        });

        const post = await doc.save();

        res.json(post);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать статью'
        });
    }
}

export const update = async (req, res) => {
    try {
        const postID = req.params.id;

        await PostModel.updateOne({
            _id: postID
        }, {
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.userId,
        });

        res.json({
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось отредактировать статью'
        });
    }
}

export const getLastTags = async (req, res) => {
    try {
        //.limit(5).exec() - get from last 5
        const posts = await PostModel.find().limit(5).exec();

        const tags = posts.map(obj => obj.tags).flat().slice(0, 5);

        res.json(tags);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить теги'
        });
    }
}