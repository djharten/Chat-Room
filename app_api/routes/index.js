var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload'
});
//var ctrlBlog = require('../controllers/blog');
var ctrlAuth = require('../controllers/authentication');

/* GET, POST, PUT and DELETE API routes for blog pages
router.get('/blog', ctrlBlog.blogList);
router.post('/blog', auth, ctrlBlog.addOne);
router.get('/blog/:blogid', ctrlBlog.readOne);
router.put('/blog/:blogid', auth, ctrlBlog.editOne);
router.delete('/blog/:blogid', auth, ctrlBlog.deleteOne);
*/

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;