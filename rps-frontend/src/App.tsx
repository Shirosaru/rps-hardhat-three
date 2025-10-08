import { useEffect, useState } from "react";
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
  const [game, setGame] = useState<ethers.Contract>();
  const [token, setToken] = useState<ethers.Contract>();
  const [choice, setChoice] = useState<number>(1); // 1: Rock, 2: Paper, 3: Scissors
  const [gameId, setGameId] = useState<number>(1);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) return;
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
    const signer = await provider.getSigner();
    setSigner(signer);

    const token = new ethers.Contract(TOKEN_ADDRESS, ERC20TokenAbi.abi, signer);
    const game = new ethers.Contract(GAME_ADDRESS, RockPaperScissorsAbi.abi, signer);

    setToken(token);
    setGame(game);
  };

  const approveAndCreateGame = async () => {
    if (!token || !game || !signer) return;
    setStatus("Approving tokens...");
    const amount = ethers.parseEther("10");

    const approveTx = await token.approve(GAME_ADDRESS, amount);
    await approveTx.wait();

    setStatus("Creating game...");
    const createTx = await game.createGame(choice);
    await createTx.wait();

    setStatus("Game created!");
  };

  const approveAndJoinGame = async () => {
    if (!token || !game || !signer) return;
    setStatus("Approving tokens...");
    const amount = ethers.parseEther("10");

    const approveTx = await token.approve(GAME_ADDRESS, amount);
    await approveTx.wait();

    setStatus("Joining game...");
    const joinTx = await game.joinGame(gameId, choice);
    await joinTx.wait();

    setStatus("Game joined!");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>🪨📄✂️ Rock Paper Scissors</h2>
      {!account ? (
        <button onClick={connectWallet}>🔌 Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {account}</p>
          <label>
            🎮 Choice:{" "}
            <select value={choice} onChange={(e) => setChoice(Number(e.target.value))}>
              <option value={1}>Rock</option>
              <option value={2}>Paper</option>
              <option value={3}>Scissors</option>
            </select>
          </label>
          <br />
          <br />
          <button onClick={approveAndCreateGame}>➕ Create Game</button>
          <br />
          <br />
          <label>
            Game ID to join:{" "}
            <input
              type="number"
              value={gameId}
              onChange={(e) => setGameId(Number(e.target.value))}
              style={{ width: "80px" }}
            />
          </label>
          <br />
          <button onClick={approveAndJoinGame}>🎯 Join Game</button>
          <br />
          <br />
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
}

export default App;
