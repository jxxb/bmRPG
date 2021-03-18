//Maze generator
const Maze = require('../controllers/maze');

//Models
const User = require('../models/user');
const Game = require('../models/game');

// Mongoose
const mongoose = require('mongoose');

exports.patchNewGame = (req, res, next) => {
    const x = req.body.h;
    const y = req.body.w;
    const maze = new Maze(x, y);

    const game = new Game({
        maze: maze.convert(),
        userIndex: 11, //To change, would be a random number from 0 to matrix.lengh - 1
        enemyList: [] //I asume is a list of numbers with the indexes of the position of each enemy
    });
    res.json(game);
};

exports.putLoadGame = (req, res, next) => {
    const gameId = req.body.gameId;
    console.log('gameId: ' + gameId);
    Game.findById(gameId).then(maze => {
        res.json(maze);
    }).catch(err => {
        console.log(err);
        res.json({ status: 500, message: 'Something went wrong loading the game' });
    });
}

exports.postSaveGame = (req, res, next) => {
    const maze = req.body.maze;
    const enemyList = req.body.enemyList;
    const id = req.body._id;
    const userIndex = req.body.userIndex;
    const userId = req.body.playerId;


    Game.countDocuments({ _id: id }, function (err, count) {
        if (count > 0) { // game exists so update game
            console.log(id);
            Game.findByIdAndUpdate(
                id,
                {
                    maze: maze,
                    userIndex: userIndex,
                    enemyList: enemyList
                }
            ).then(result => {
                res.json({ status: 200, message: 'Game saved' });
            }).catch(err => {
                console.log(err);
                res.json({ status: 500, message: 'Something went wrong saving the game' });
            })
        } else { // save game as new game
            const game = new Game({
                maze: maze,
                userIndex: userIndex,
                enemyList: enemyList,
                _id: id
            });
            game.save()
                .then(result => {
                    newGame = result;
                    return User.findById(userId)
                })
                .then(user => {
                    if (!user.games) {
                        user.games = [];
                    }

                    user.games.push(newGame);
                    user.save();
                    res.json({ status: 200, message: 'Game saved' });
                })
                .catch(err => {
                    console.log(err)
                    if (!userId) {
                        res.json({ status: 500, message: 'playerId field is missing' });
                    } else {
                        res.json({ status: 500, message: 'Something went wrong saving the game' });
                    }
                });
        }
    }).catch(err => {
        res.json({ status: 500, message: 'Something went wrong saving the game' });
    })



}

/* Old patchNewGame
exports.patchNewGame = (req,res,next) => {
    const x = req.body.h;
    const y = req.body.w;
    const userId = req.body.userId;
    const maze = new Maze(x,y);

    let newGame;
    const game = new Game({
        maze: maze.convert(),
        userIndex: 11, //To change, would be a random number from 0 to matrix.lengh - 1
        enemyList: [] //I asume is a list of numbers with the indexes of the position of each enemy
    });

    game.save() // game should NOT be saving
    .then(result => {
        newGame = result;
        return User.findById(userId)
    })
    .then(user => {
        if (!user.games)
            user.games = [];

        user.games.push(newGame); // get rid of this
        user.save(); // get rid of this
        res.json(newGame);
    })
    .catch(err => {
        console.log(err)
        res.json({status: 500, message:'Something went wrong saving the game'} );
    })
}
*/