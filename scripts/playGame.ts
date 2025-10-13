import { ethers } from "hardhat";
import { Wallet, JsonRpcProvider } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const deployer = new Wallet(process.env.PRIVATE_KEY_1!, provider);
  const player1 = new Wallet(process.env.PRIVATE_KEY_2!, provider);
  const player2 = new Wallet(process.env.PRIVATE_KEY_3!, provider);

  console.log("Deployer:", deployer.address);
  console.log("Player1:", player1.address);
  console.log("Player2:", player2.address);

  const tokenAddress = "0x84A444e5BB47Ff8cE066937aDe1c1650A91574b4"; // Your deployed ERC20 token

  // ✅ DEPLOY the updated RockPaperScissors contract
  const GameFactory = await ethers.getContractFactory("RockPaperScissors", deployer);
  const game = await GameFactory.deploy(tokenAddress);
  await game.waitForDeployment();

  const gameAddress = await game.getAddress();
  console.log("✅ RockPaperScissors deployed at:", gameAddress);

  // ✅ Send tokens to players
  const token = await ethers.getContractAt("ERC20Token", tokenAddress, deployer);
  const transferAmount = ethers.parseEther("100");

  console.log("Transferring tokens to players...");
  await token.transfer(player1.address, transferAmount);
  await token.transfer(player2.address, transferAmount);

  // ✅ Approve tokens
  const tokenAsPlayer1 = token.connect(player1);
  const tokenAsPlayer2 = token.connect(player2);
  const amountToPlay = ethers.parseEther("10");

  await tokenAsPlayer1.approve(gameAddress, amountToPlay);
  await tokenAsPlayer2.approve(gameAddress, amountToPlay);

  // ✅ Create + Join game
  const tx1 = await game.connect(player1).createGame(1); // Rock
  await tx1.wait();

  const tx2 = await game.connect(player2).joinGame(1, 3); // Scissors
  await tx2.wait();

  console.log("✅ Game created and played!");

  // ✅ (Optional) Fetch result
  const result = await game.getGameResult(1);
  console.log("🧾 Game Result:");
  console.log("Player1:", result[0]);
  console.log("Choice1:", result[1]);
  console.log("Player2:", result[2]);
  console.log("Choice2:", result[3]);
  console.log("Winner :", result[5]);
}

main().catch((err) => {
  console.error("❌ Script error:", err);
  process.exitCode = 1;
});
