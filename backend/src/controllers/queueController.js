const Game = require('../models/game');
const Queue = require('../models/queue');


exports.addToQueue = async (req, res, io) => {
  // Get the user ID from the request (assuming you have implemented authentication)
  const userId = req.user._id;
  const { categories } = req.body;
  const socketId = 'generate or retrieve the socket ID for the user';

  try {
    // Create a new queue document
    const queue = new Queue({
      user: userId,
      categories: categories,
      socketId: socketId,
    });

    // Save the queue document to the database
    await queue.save();

    io.to(socketId).emit('connect_socket');
    res.status(200).json({ socketId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add user to the queue' });
  }
};

exports.pairPlayersAndCreateGames = async (io) => {
  try {
    // Fetch all players in the queue
    const players = await Queue.find().populate('categories');

    // Create an empty array to store paired players
    const pairedPlayers = [];

    // Iterate through the players in the queue
    for (let i = 0; i < players.length; i++) {
      const player = players[i];

      // Check if the player has any categories
      if (player.categories.length > 0) {
        // Find a matching player with at least one similar category
        const matchingPlayer = players.find(
          (p) => p._id !== player._id && p.categories.some((c) => player.categories.includes(c)) && !pairedPlayers.includes(p._id)
        );

        if (matchingPlayer) {
          // Create a game with the paired players
          const game = new Game({
            //players: [player._id, matchingPlayer._id],
            //categories: player.categories,
            user_1: players[0]._id,
            user_2: players[1]._id,
            // Add any additional game properties
          });

          // Save the game
          await game.save();

          // Emit Socket.io events to notify players and handle game creation
          io.to(players[0].socketId).emit('game_created');
          io.to(players[1].socketId).emit('game_created');

          // Add the paired players to the array
          pairedPlayers.push(player._id, matchingPlayer._id);
        }
      }
    }

    // Remove the paired players from the queue
    await Queue.deleteMany({ _id: { $in: pairedPlayers } });

    // Log the number of games created and paired players
    console.log(`Created ${pairedPlayers.length / 2} games.`);
    console.log(`Paired ${pairedPlayers.length} players.`);
  } catch (error) {
    console.error('Error in cron job:', error);
  }
}