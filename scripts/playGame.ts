import { ethers } from "hardhat";
import { Wallet, JsonRpcProvider } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

  const deployer = new Wallet(process.env.PRIVATE_KEY_1!, provider);
  const player1 = new Wallet(process.env.PRIVATE_KEY_2!, provider);
  const player2 = new Wallet(process.env.PRIVATE_KEY_3!, provider);

  console.log("Deployer ETH:", ethers.formatEther(await provider.getBalance(deployer.address)));
  console.log("Player1 ETH:", ethers.formatEther(await provider.getBalance(player1.address)));
  console.log("Player2 ETH:", ethers.formatEther(await provider.getBalance(player2.address)));

  const tokenAddress = "0x84A444e5BB47Ff8cE066937aDe1c1650A91574b4"; // <- REPLACE with actual
  const gameAddress = "0xd049930c5B42b4903f61e17140dec393c94178c7";   // <- REPLACE with actual

  const token = await ethers.getContractAt("ERC20Token", tokenAddress, deployer);
  const game = await ethers.getContractAt("RockPaperScissors", gameAddress, deployer);

  const amountToPlay = ethers.parseEther("10");

  // 💸 Send tokens from deployer to players
  console.log("Transferring tokens to players...");
  await token.transfer(player1.address, ethers.parseEther("100"));
  await token.transfer(player2.address, ethers.parseEther("100"));

  // ✅ DEBUG: Check balances and allowances
  console.log("\n✅ Checking balances and allowances:");
  console.log("Player1 address:", player1.address);
  console.log("Player2 address:", player2.address);
  console.log("Game contract address:", gameAddress);

  console.log("Player1 token balance:", await token.balanceOf(player1.address));
  console.log("Player2 token balance:", await token.balanceOf(player2.address));
  console.log("Player1 allowance:", await token.allowance(player1.address, gameAddress));
  console.log("Player2 allowance:", await token.allowance(player2.address, gameAddress));

  // ✅ Players approve the game contract to spend their tokens
  const tokenAsPlayer1 = token.connect(player1);
  const tokenAsPlayer2 = token.connect(player2);

  // ✅ Players approve the game contract to spend their tokens
  await tokenAsPlayer1.approve(gameAddress, amountToPlay);
  await tokenAsPlayer2.approve(gameAddress, amountToPlay);

  // ✅ Player 1 creates a game with Rock (1)
  const tx = await game.connect(player1).createGame(1);
  await tx.wait(); // Ensure the transaction is mined
  console.log("✅ Game created!");

  // ✅ Player 2 joins the game with Scissors (3)
  await game.connect(player2).joinGame(1, 3);
  console.log("✅ Player 2 joined the game!");

  console.log("✅ Game played successfully!");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exitCode = 1;
});
