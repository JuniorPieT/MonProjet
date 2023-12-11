const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const passport = require('passport');


// Route pour créer un nouvel utilisateur
router.post('/signup', userController.createUser);

// Route pour l'authentification de l'utilisateur
router.post('/login', userController.loginUser);

router.get('/', passport.authenticate('jwt', { session: false }), userController.getUser);

module.exports = router;