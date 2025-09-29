// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RockPaperScissors is Ownable2Step {
    IERC20 public token;

    enum Choice { None, Rock, Paper, Scissors }
    enum GameResult { None, Win, Lose, Draw }

    struct Game {
        address player1;
        Choice choice1;
        address player2;
        Choice choice2;
        bool isActive;
    }

    mapping(uint256 => Game) public games;
    uint256 public gameIdCounter;

    event GameCreated(uint256 gameId, address player1);
    event GameOutcome(uint256 gameId, GameResult result);

    constructor(IERC20 _token) Ownable(msg.sender) {
        token = _token;
    }

    function createGame(Choice choice1) public returns (uint256) {
        gameIdCounter++;
        games[gameIdCounter] = Game(msg.sender, choice1, address(0), Choice.None, true);
        emit GameCreated(gameIdCounter, msg.sender);
        return gameIdCounter;
    }

    function joinGame(uint256 gameId, Choice choice2) public {
        Game storage game = games[gameId];
        require(game.player1 != address(0), "Game does not exist");
        require(game.player2 == address(0), "Game already joined");
        require(msg.sender != game.player1, "Cannot join your own game");

        game.player2 = msg.sender;
        game.choice2 = choice2;

        determineWinner(gameId);
    }

    function determineWinner(uint256 gameId) internal {
        Game storage game = games[gameId];
        require(game.isActive, "Game is not active");

        Choice choice1 = game.choice1;
        Choice choice2 = game.choice2;

        GameResult result;

        if (choice1 == choice2) {
            result = GameResult.Draw;
        } else if (
            (choice1 == Choice.Rock && choice2 == Choice.Scissors) ||
            (choice1 == Choice.Paper && choice2 == Choice.Rock) ||
            (choice1 == Choice.Scissors && choice2 == Choice.Paper)
        ) {
            result = GameResult.Win;
        } else {
            result = GameResult.Lose;
        }

        address winner;
        address loser;

        if (result == GameResult.Win) {
            winner = game.player1;
            loser = game.player2;
        } else if (result == GameResult.Lose) {
            winner = game.player2;
            loser = game.player1;
        }

        if (winner != address(0)) {
            require(token.balanceOf(loser) >= 10 * 10**18, "Insufficient loser balance");
            token.transferFrom(loser, address(this), 10 * 10**18);
            token.transfer(winner, 10 * 10**18);
        }

        emit GameOutcome(gameId, result);
        game.isActive = false;
        delete games[gameId]; // optional
    }
}
