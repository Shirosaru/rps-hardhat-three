import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import RockPaperScissorsAbi from "./abi/RockPaperScissors.json";
import ERC20TokenAbi from "./abi/ERC20Token.json";

const GAME_ADDRESS = process.env.REACT_APP_GAME_ADDRESS!;
const TOKEN_ADDRESS = process.env.REACT_APP_TOKEN_ADDRESS!;

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const [provider, setProvider] = useState<ethers.BrowserProvider>();
  const [signer, setSigner] = useState<ethers.Signer>();
  const [account, setAccount] = useState<string>("");
  const [gameContract, setGameContract] = useState<ethers.Contract>();
  const [tokenContract, setTokenContract] = useState<ethers.Contract>();
  const [choice, setChoice] = useState<number>(1);
  const [latestGameId, setLatestGameId] = useState<number>(0);
  const [status, setStatus] = useState<string>("Not connected");
  const [userBalance, setUserBalance] = useState<string>("0");
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [gameData, setGameData] = useState<any>(null);
  const [outcome, setOutcome] = useState<any>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // Connect MetaMask on load
  useEffect(() => {
    if (window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
    }
  }, []);

  // Update balances
  const updateBalances = useCallback(async () => {
    if (!tokenContract || !account) return;
    const user = await tokenContract.balanceOf(account);
    const contract = await tokenContract.balanceOf(GAME_ADDRESS);
    setUserBalance(ethers.formatEther(user));
    setContractBalance(ethers.formatEther(contract));
  }, [tokenContract, account]);

  // Update game status and result message
  const updateGameStatus = useCallback(async (gameId: number) => {
    if (!gameContract || !gameId || !account) return;
    try {
      const game = await gameContract.games(gameId);
      const outcome = await gameContract.outcomes(gameId);
      setGameData(game);
      setOutcome(outcome);

      if (!game.isActive && outcome.result !== 0) {
        const winner = outcome.winner;
        let resultMsg = "";

        if (winner === ethers.ZeroAddress) {
          resultMsg = "🤝 It's a draw!";
        } else if (winner.toLowerCase() === account.toLowerCase()) {
          resultMsg = "🏆 You won!";
        } else {
          resultMsg = "😢 You lost!";
        }

        setResultMessage(resultMsg);
        setStatus(`🏁 Game Over. Winner: ${winner === ethers.ZeroAddress ? "Draw" : winner}`);
      } else {
        setStatus(`⏳ Game ${gameId} active. Waiting for player 2...`);
        setResultMessage(null);
      }
    } catch (err) {
      console.warn("Status check failed:", err);
    }
  }, [gameContract, account]);

  // Poll for updates every 5 seconds
  useEffect(() => {
    if (!account || !gameContract || !tokenContract) return;

    const poll = setInterval(async () => {
      try {
        const id = await gameContract.gameIdCounter();
        setLatestGameId(Number(id));
        updateBalances();
        updateGameStatus(Number(id));
      } catch (err) {
        console.warn("Polling failed:", err);
      }
    }, 5000);

    return () => clearInterval(poll);
  }, [account, gameContract, tokenContract, updateBalances, updateGameStatus]);

  // Connect wallet
  const connectWallet = async () => {
    if (!provider) return setStatus("❌ No wallet found.");

    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const token = new ethers.Contract(TOKEN_ADDRESS, ERC20TokenAbi.abi, signer);
      const game = new ethers.Contract(GAME_ADDRESS, RockPaperScissorsAbi.abi, signer);

      setAccount(accounts[0]);
      setSigner(signer);
      setTokenContract(token);
      setGameContract(game);
      setStatus("✅ Wallet connected.");
    } catch (err: any) {
      setStatus("❌ Wallet connection failed: " + err.message);
    }
  };

  // Create game
  const approveAndCreateGame = async () => {
    if (!tokenContract || !gameContract || !signer) return;
    const stake = ethers.parseEther("10");

    try {
      setStatus("🛂 Approving token transfer...");
      await (await tokenContract.approve(GAME_ADDRESS, stake)).wait();

      setStatus("🎮 Creating game...");
      await (await gameContract.createGame(choice)).wait();

      const id = await gameContract.gameIdCounter();
      setLatestGameId(Number(id));
      setStatus(`✅ Game created with ID: ${id}`);
    } catch (err: any) {
      setStatus("❌ Create game failed: " + err.message);
    }
  };

  // Join game
  const approveAndJoinGame = async () => {
    if (!tokenContract || !gameContract || !signer || !latestGameId) return;
    const stake = ethers.parseEther("10");

    try {
      setStatus("🛂 Approving token transfer...");
      await (await tokenContract.approve(GAME_ADDRESS, stake)).wait();

      setStatus("🎯 Joining game...");
      await (await gameContract.joinGame(latestGameId, choice)).wait();

      setStatus(`✅ Joined game ${latestGameId}`);
    } catch (err: any) {
      setStatus("❌ Join game failed: " + err.message);
    }
  };

  // Fetch result manually
  const getGameResult = async () => {
    if (!gameContract || !latestGameId || !account) return;

    try {
      const result = await gameContract.getGameResult(latestGameId);
      const [p1, c1, p2, c2, , winner] = result;

      const toText = (c: number) => ["None", "Rock", "Paper", "Scissors"][c];

      let resultMsg = "";
      if (winner === ethers.ZeroAddress) {
        resultMsg = "🤝 It's a draw!";
      } else if (winner.toLowerCase() === account.toLowerCase()) {
        resultMsg = "🏆 You won!";
      } else {
        resultMsg = "😢 You lost!";
      }

      setResultMessage(resultMsg);

      setStatus(`🧾 Game ${latestGameId}
Player 1: ${p1} chose ${toText(c1)}
Player 2: ${p2} chose ${toText(c2)}
🏆 Winner: ${winner === ethers.ZeroAddress ? "Draw" : winner}`);
    } catch (err) {
      setStatus("❌ Could not fetch result.");
      setResultMessage(null);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "Arial", maxWidth: 640, margin: "auto" }}>
      <h2>🪨📄✂️ Rock Paper Scissors on Sepolia</h2>

      {!account ? (
        <button onClick={connectWallet}>🔌 Connect Wallet</button>
      ) : (
        <>
          <p>✅ Connected: {account}</p>
          <p>💰 Token Balance: {userBalance} RPS</p>
          <p>🏛 Contract Balance: {contractBalance} RPS</p>

          <hr />

          <label>
            🎮 Choose Move:
            <select value={choice} onChange={(e) => setChoice(Number(e.target.value))}>
              <option value={1}>Rock</option>
              <option value={2}>Paper</option>
              <option value={3}>Scissors</option>
            </select>
          </label>

          <div style={{ marginTop: 12 }}>
            <button onClick={approveAndCreateGame}>➕ Create Game</button>
          </div>

          <div style={{ marginTop: 12 }}>
            <p>Latest Game ID: {latestGameId || "N/A"}</p>
            <button onClick={approveAndJoinGame}>🎯 Join Game</button>
          </div>

          <div style={{ marginTop: 12 }}>
            <button onClick={getGameResult}>📊 Get Game Result</button>
          </div>

          <hr />
          <p>Status: {status}</p>

          {resultMessage && (
            <p
              style={{
                color: resultMessage.includes("won")
                  ? "green"
                  : resultMessage.includes("lost")
                  ? "red"
                  : "orange",
                fontSize: "1.2em",
                fontWeight: "bold",
                marginTop: 12,
              }}
            >
              {resultMessage}
            </p>
          )}

          {gameData && (
            <div>
              <h4>🛠 Game Info</h4>
              <pre style={{ fontSize: 14, background: "#eee", padding: 12 }}>
                {JSON.stringify(gameData, null, 2)}
              </pre>
            </div>
          )}

          {outcome && outcome.result !== 0 && (
            <div>
              <h4>🏁 Outcome</h4>
              <pre style={{ fontSize: 14, background: "#e8f4e8", padding: 12 }}>
                {JSON.stringify(outcome, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
