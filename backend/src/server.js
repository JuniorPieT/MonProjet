const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
require('./config/passport')(passport);
const cron = require('node-cron');
const http = require('http');
const socketIO = require('socket.io');
const { pairPlayersAndCreateGames } = require('./controllers/queueController');


mongoose.connect('mongodb://127.0.0.1:27017/debate', { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to mongodb://127.0.0.1:27017/debate');
});

mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});


const app = express();


const server = http.createServer(app);

const io = socketIO(server);
module.exports = { io }; // Export the `io` object

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

const userRoutes = require('./routes/userRoutes');
const queueRoutes = require('./routes/queueRoutes')
const categoriesRoutes = require('./routes/categoriesRoutes')

app.use('/queue', queueRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoriesRoutes);

server.listen(3000, () => console.log('Server is running on port 3000'));



// Schedule the task to run every minute
cron.schedule('* * * * *', async () => {
  try {
    // Query the queue collection to fetch available players
    await pairPlayersAndCreateGames(io);
  } catch (error) {
    console.error('Error in matchmaking task:', error);
  }
});

io.on('connection', (socket) => {
  console.log('New socket connection:', socket.id);

  socket.on('join_game', (gameID) => {
    socket.join(gameID);
  });

  socket.on('player_move', (moveData) => {
    // Handle the player move and update game state
    // ...

    // Emit game state updates to the game room
    io.to(gameID).emit('update_game_state', { gameState });
  });
});


