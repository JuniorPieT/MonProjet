const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ message: 'L\'utilisateur existe déjà' });
    }

    const user = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      wins: 0,
      losses: 0,
      draws: 0
    });
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    res.status(500).send({ message: 'Server Error' });
  }
};

exports.loginUser = async (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : 'Login failed',
        user   : user
      });
    }

    const payload = {
      userId: user._id,
      username: user.username,
      expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
    };

    req.login(payload, {session: false}, (error) => {
      if (error) {
        return res.status(400).send({ error });
      }

      const token = jwt.sign(JSON.stringify(payload), 'your-secret-key'); // replace with your secret key

      res.status(200).json({ token });
    });
  })(req, res, next);
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.user._id

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};