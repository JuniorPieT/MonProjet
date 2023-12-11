const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    user_1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    user_2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}); 

const Category = mongoose.model('Game', gameSchema);

module.exports = Category;