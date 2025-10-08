import { ethers } from "hardhat";

async function main() {
  // Replace this with your actual deployed game contract address
  const gameAddress = "0xd049930c5B42b4903f61e17140dec393c94178c7";

  // Connect to the deployed contract
  const game = await ethers.getContractAt("RockPaperScissors", gameAddress);

  // Assuming your contract has a public 'token' variable
  const tokenAddress = await game.token();
  console.log("Game is using token:", tokenAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
