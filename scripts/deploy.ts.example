import { ethers } from "hardhat";

async function main() {
  const Token = await ethers.getContractFactory("ERC20Token");
  const token = await Token.deploy();
  await token.waitForDeployment();
  console.log("Token deployed to:", await token.getAddress());

  const Game = await ethers.getContractFactory("RockPaperScissors");
  const game = await Game.deploy(await token.getAddress());
  await game.waitForDeployment();
  console.log("Game deployed to:", await game.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
