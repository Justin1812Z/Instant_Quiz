const express = require('express');
const controller = require('../controllers/userController');
const router = express.Router();

router.get('/getLogin', controller.getLogin);

router.get('/signup', controller.getSignup);

router.post('/signup', controller.signup);

router.post('/login', controller.login);

router.get('/profile', controller.getProfile);

router.get('/logout', controller.logout);


module.exports = router;