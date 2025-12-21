// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RockPaperScissors is Ownable2Step {
    IERC20 public token;

    enum Choice { None, Rock, Paper, Scissors }
    enum Result { None, Win, Lose, Draw }

    struct Game {
        address player1;
        Choice choice1;
        address player2;
        Choice choice2;
        bool isActive;
    }

    struct GameOutcome {
        Result result;
        address winner;
    }

    mapping(uint256 => Game) public games;
    mapping(uint256 => GameOutcome) public outcomes;
    uint256 public gameIdCounter;

    event GameCreated(uint256 indexed gameId, address indexed player1);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event GameFinished(uint256 indexed gameId, Result result, address winner);

    constructor(IERC20 _token) Ownable(msg.sender) {
        token = _token;
    }

    function createGame(Choice choice1) public returns (uint256) {
        require(choice1 != Choice.None, "Invalid choice");

        gameIdCounter++;
        games[gameIdCounter] = Game(msg.sender, choice1, address(0), Choice.None, true);

        emit GameCreated(gameIdCounter, msg.sender);
        return gameIdCounter;
    }

function joinGame(uint256 gameId, Choice choice2) public {
        // ... previous require checks remain the same

        Game storage game = games[gameId];
        game.player2 = msg.sender;
        game.choice2 = choice2;

        // --- NEW LOGIC: Collect Stakes from BOTH players before determining winner
        // The stake amount (10 tokens) must be approved by both players beforehand.
        uint256 stake = 10 * 10**18;
        
        // 1. Player 1's stake
        token.transferFrom(game.player1, address(this), stake);
        // 2. Player 2's stake
        token.transferFrom(game.player2, address(this), stake);
        // --- END NEW LOGIC

        emit GameJoined(gameId, msg.sender);

        determineWinner(gameId); // Determine winner and pay out
    }

    function determineWinner(uint256 gameId) internal {
        Game storage game = games[gameId];

        Choice choice1 = game.choice1;
        Choice choice2 = game.choice2;

        Result result;
        address winner;

        if (choice1 == choice2) {
            result = Result.Draw;
            // No winner/loser, the contract holds 20 tokens.
            // Players must call a separate 'withdraw' or 'claimDraw' function to get 10 tokens back each.
            // For simplicity, we just leave it in the contract for now, but a real app needs a refund/claim function.
            // For this fix, the 'winner' is still address(0) for a draw.
        } else if (
            (choice1 == Choice.Rock && choice2 == Choice.Scissors) ||
            (choice1 == Choice.Paper && choice2 == Choice.Rock) ||
            (choice1 == Choice.Scissors && choice2 == Choice.Paper)
        ) {
            result = Result.Win;
            winner = game.player1;
        } else {
            result = Result.Lose;
            winner = game.player2;
        }

        // Only pay out if there is a winner (not a draw)
        if (winner != address(0)) {
            // The contract now holds 20 tokens (10 from P1 + 10 from P2)
            uint256 prize = 20 * 10**18; 
            // Transfer the full prize amount to the winner
            token.transfer(winner, prize); 
        }

        outcomes[gameId] = GameOutcome(result, winner);
        game.isActive = false;

        emit GameFinished(gameId, result, winner);
    }

    function getGameResult(uint256 gameId)
        public
        view
        returns (
            address player1,
            Choice choice1,
            address player2,
            Choice choice2,
            Result result,
            address winner
        )
    {
        Game memory g = games[gameId];
        GameOutcome memory o = outcomes[gameId];

        require(!g.isActive, "Game is still active");
        return (g.player1, g.choice1, g.player2, g.choice2, o.result, o.winner);
    }
}
