import "./styles/App.css"
import twitterLogo from "./assets/twitter-logo.svg"
import React, { useState,useEffect } from "react"
import { ethers } from "ethers";
import myEpicSkull from "./utils/MyEpicSkull.json";


// Constants
const TWITTER_HANDLE = "web3dev_"
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`
const OPENSEA_LINK = "https://testnets.opensea.io/collection/skullrgbnft-v2"
const CONTRACT_ADDRESS = "0xa0Ab8d249997809480a92fb4dA896A756d879809"

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Certifique-se que você tem o MetaMask instalado");
      return;
    } else {
      console.log("Temos o objeto ethereum!", ethereum);
    }
    
    const accounts = await ethereum.request({ method: "eth_accounts" })
    if(accounts.length !== 0) {
      const account = accounts[0];
      console.log("Encontrou uma conta autorizada: ", account);
      setCurrentAccount(account);
      // Setup listener! Isso é para quando o usuário vem no site
      // e já tem a carteira conectada e autorizada
      setupEventListener();
    } else {
      console.log("Nenhuma conta autorizada foi encontrada.");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if(!ethereum) {
        alert("Baixe o Metamask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Conectado", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // Setup do listener.
  const setupEventListener = async () => {
    // é bem parecido com a função
    try {
      const { ethereum } = window

      if (ethereum) {
        // mesma coisa de novo
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicSkull.abi, signer)

        // Aqui está o tempero mágico.
        // Isso essencialmente captura nosso evento quando o contrato lança
        // Se você está familiar com webhooks, é bem parecido!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(
            `Olá pessoal! Já cunhamos seu NFT. Pode ser que esteja branco agora. Demora no máximo 10 minutos para aparecer no OpenSea. Aqui está o link: <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}>`
          )
        })

        console.log("Setup event listener!")
      } else {
        console.log("Objeto ethereum não existe!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicSkull.abi,
          signer
        );
        console.log("Vai abrir a carteira agora para pagar o gás...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Cunhando...espere por favor.");
        await nftTxn.wait();
        console.log(
          `Cunhado, veja a transação: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Objeto ethereum não existe!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">Conectar Carteira</button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text"> Coleção de NFT Caveiras </p>
          <p className="sub-text"> 💀 Feliz Dia de Los Muertos! Clique e descubra seu NFT hoje. 💀</p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ):(
            <button onClick={askContractToMintNft} className='cta-button connect-wallet-button'>
              Mintar NFT
            </button>
          )}          
        </div>
        <div>
          <a className="footer-text"
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer">
              🌊 Exibir coleção no OpenSea
          </a>
        </div>
        <div className="footer-container">
          <div>
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`feito com ❤️ pela @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
