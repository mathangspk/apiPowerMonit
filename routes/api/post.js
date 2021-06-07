const express = require('express');
const router = express.Router();
const { postValidation } = require('../../validation')
const verify = require('../verifyToken');
// Post Model
const Post = require('../../models/Post');

//@route GeT api/posts
//@desc Get all posts
//@access Public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then(posts => res.json(posts));
});
//@route POST api/posts
//@desc Create an posts
//@access Public
router.post('/', verify, (req, res) => {
    //let validate the data before we a user
    const { error } = postValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const newPost = new Post({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        content: req.body.content,
        category: req.body.category,
    });
    newPost.save()
        .then(Post => res.json(Post))
        .catch(err => res.json(err))
        ;
})

//@route DELETE api/posts:id
//@desc delete an posts
//@access Public
router.delete('/:id', verify, (req, res) => {
    Post.findById(req.params.id)
        .then(Post => Post.remove().then(() => res.json({ success: true })))
        .catch(err => res.status(404).json({ success: false }))
})

//update Post
router.patch('/:postId', verify, async (req, res) => {
    try {
        const updatePost = await Post.updateOne(
            { _id: req.params.postId },
            {
                $set: {
                    title: req.body.title,
                    author: req.body.author,
                    description: req.body.description,
                    content: req.body.content,
                    category: req.body.category,
                }
            })
        res.json(updatePost);
    } catch (err) {
        res.json({ message: err });
    }
})

router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(Post => {
            res.json(Post)
        })
})

module.exports = router;