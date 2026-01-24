# 🎮 Rock-Paper-Scissors Blockchain Game

Welcome to the **Rock-Paper-Scissors Blockchain Game**! 🪨📄✂️ This is a decentralized gaming platform where you can play the classic Rock-Paper-Scissors game on the blockchain, with real stakes using ERC20 tokens.

## 🌟 What is This?

This project combines the timeless fun of Rock-Paper-Scissors with the power of blockchain technology. Built with **Hardhat**, **Solidity**, and **Three.js**, it features:

- **Smart Contract Gaming**: Play Rock-Paper-Scissors with provably fair results on the blockchain
- **Token-Based Stakes**: Use ERC20 tokens to place wagers and win prizes
- **Secure & Transparent**: All game logic runs on-chain, ensuring fairness and transparency
- **Interactive Frontend**: Multiple frontend implementations to choose from

## 🎯 Key Features

- ✅ **Decentralized Gameplay**: No central authority needed - the smart contract handles everything
- 💰 **Token Staking**: Each player stakes 10 tokens, winner takes all (20 tokens)
- 🔒 **Secure**: Built with OpenZeppelin's battle-tested contracts
- 🎨 **Multiple Frontends**: Choose from different UI implementations
- 🧪 **Well-Tested**: Comprehensive test suite included

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MetaMask** or another Web3 wallet (for frontend interaction)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Compile Smart Contracts

```bash
npm run compile
```

### 3. Run Tests

```bash
npm test
```

To see gas usage statistics:

```bash
REPORT_GAS=true npm test
```

### 4. Deploy to Local Network

Start a local Hardhat node:

```bash
npx hardhat node
```

In a new terminal, deploy the contracts:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

## 🎮 How to Play

1. **Create a Game**: Player 1 creates a game by selecting Rock, Paper, or Scissors
2. **Join a Game**: Player 2 joins the game with their choice
3. **Automatic Resolution**: The smart contract determines the winner and transfers the prize
4. **Winner Takes All**: The victor receives 20 tokens (both players' stakes)

## 📁 Project Structure

```
rps-game/
├── contracts/              # Smart contracts
│   ├── RockPaperScissors.sol  # Main game contract
│   ├── ERC20Token.sol          # Token contract
│   └── Lock.sol                # Sample contract
├── scripts/                # Deployment scripts
├── test/                   # Contract tests
├── rps-frontend/           # ✅ Active frontend (Use this!)
├── rock-paper-frontend_obsolete/    # ⚠️ OBSOLETE (default Vite template)
└── rps-dapp_obsolete/              # ⚠️ OBSOLETE (default React template)
```

> **Note**: The `rock-paper-frontend_obsolete` and `rps-dapp_obsolete` folders contain default boilerplate templates and are **not** used. The active frontend implementation is in `rps-frontend`.

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm test` | Run test suite |
| `npx hardhat help` | Display all available Hardhat tasks |
| `npx hardhat node` | Start local blockchain node |
| `npx hardhat clean` | Clear cache and artifacts |

## 🔍 Smart Contract Details

The `RockPaperScissors` contract implements:

- **Game Creation**: Players can create new games with their choice
- **Game Joining**: Other players can join existing games
- **Automatic Winner Determination**: Smart contract logic determines winners
- **Token Management**: Handles stake collection and prize distribution
- **Event Emissions**: Track game lifecycle with events

## 🤝 Contributing

Feel free to fork this project and submit pull requests! Whether it's bug fixes, new features, or improvements to the documentation, all contributions are welcome.

## 📝 License

This project is licensed under the MIT License.

## 💡 Tips

- Always approve token spending before creating or joining games
- Check your wallet has enough tokens before playing
- Use the test network first to familiarize yourself with the game

---

**Happy Gaming! May the best strategist win! 🎉**
