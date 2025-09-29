import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20Token, RockPaperScissors } from "../typechain-types";

describe("RockPaperScissors", function () {
  let token: ERC20Token;
  let game: RockPaperScissors;
  let owner: any, player1: any, player2: any;

  const TOKENS_TO_MINT = ethers.parseEther("1000");
  const TOKENS_TO_PLAY = ethers.parseEther("10");

  beforeEach(async () => {
    [owner, player1, player2] = await ethers.getSigners();

    // Deploy ERC20Token
    const TokenFactory = await ethers.getContractFactory("ERC20Token");
    token = (await TokenFactory.deploy()) as ERC20Token;
    //await token.deployed();

    // Deploy RockPaperScissors with token address
    const GameFactory = await ethers.getContractFactory("RockPaperScissors");
    game = (await GameFactory.deploy(token.target)) as RockPaperScissors;
    //await game.deployed();

    // Transfer tokens to players from owner (who was minted tokens in constructor)
    await token.transfer(player1.address, TOKENS_TO_MINT);
    await token.transfer(player2.address, TOKENS_TO_MINT);

    // Players approve game contract to spend their tokens
    await token.connect(player1).approve(game.target, TOKENS_TO_PLAY);
    await token.connect(player2).approve(game.target, TOKENS_TO_PLAY);
  });

  it("Should allow player1 to create a game", async () => {
    await game.connect(player1).createGame(1); // Rock
    const gameData = await game.games(1);
    expect(gameData.player1).to.equal(player1.address);
    expect(gameData.choice1).to.equal(1);
    expect(gameData.isActive).to.equal(true);
  });

  it("Should determine winner and transfer tokens", async () => {
    await game.connect(player1).createGame(1); // Rock
    await game.connect(player2).joinGame(1, 3); // Scissors

    const p1Balance = await token.balanceOf(player1.address);
    const p2Balance = await token.balanceOf(player2.address);

    // Player1 wins 10 tokens; player2 loses 10 tokens
    expect(p1Balance).to.equal(ethers.parseEther("1010"));
    expect(p2Balance).to.equal(ethers.parseEther("990"));
  });

  it("Should handle a draw with no token transfer", async () => {
    await game.connect(player1).createGame(2); // Paper
    await game.connect(player2).joinGame(1, 2); // Paper

    const p1Balance = await token.balanceOf(player1.address);
    const p2Balance = await token.balanceOf(player2.address);

    // Balances unchanged on draw
    expect(p1Balance).to.equal(ethers.parseEther("1000"));
    expect(p2Balance).to.equal(ethers.parseEther("1000"));
  });
});
