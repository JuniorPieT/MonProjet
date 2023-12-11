const express = require('express');
const router = express.Router();
const passport = require('passport');
const { io } = require('../server'); // Assuming you have exported the `io` object from your server.js


const queueController = require('../controllers/queueController');

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    queueController.addToQueue(req, res, io); // Pass the `io` object to the `addToQueue` function
  });
module.exports = router;
