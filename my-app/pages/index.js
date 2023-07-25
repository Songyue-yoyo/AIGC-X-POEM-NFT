import { BigNumber, Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";
// import BootstrapCarousel from "../carousels/Bootstrap";
import { items } from "../public/Items.json";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";


export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();
  const [account, setAccount] = useState("");
  const [mainProvider, setMainProvider] = useState();
  const [mainWeb3Provider, setMainWeb3Provider] = useState();
  const [mainChainId, setMainChainId] = useState("");
  const [existenceArr, setExistenceArr] = useState(() => { return (new Array(12).fill(true)); });
  const { bootstrap } = items;
  const [index, setIndex] = useState(0);
  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  // const mainChainId = useRef();

  /**
   * publicMint: Mint an NFT 
   */
  const publicMint = async (tokenId) => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the mint from the contract to mint the Crypto Dev
      const tx = await nftContract.mint(tokenId, {
        // value signifies the cost of one crypto dev which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted an NFT!");
      await checkExistence();
      /*
       * disable the button
       */
    } catch (err) {
      console.error(err);
    }
  };




  

  /**
   * getOwner: calls the contract to retrieve the owner
   */
  const getOwner = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the owner function from the contract
      const _owner = await nftContract.owner();
      // We will get the signer now to extract the address of the currently connected MetaMask account
      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const checkExistence = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      let _existenceArr = [];
      _existenceArr = await nftContract.checkMinted();
      setExistenceArr(_existenceArr);
    } catch (err) {
      console.error(err);
    }
  };

  /*
      connectWallet: Connects the MetaMask wallet
    */
      const connectWallet = async () => {
        try {
          // Get the provider from web3Modal, which in our case is MetaMask
          // When used for the first time, it prompts the user to connect their wallet
          const signer = await getProviderOrSigner(true);
          const address = await signer.getAddress();
          // setAccount(address);
          setWalletConnected(true);
          await getOwner();
          await checkExistence();
        } catch (err) {
          console.error(err);
        }
      };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    setMainProvider(provider);
    setMainWeb3Provider(web3Provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    setMainChainId("0x"+chainId.toString());
    // mainChainId.current = chainId;
    if (chainId !== 5) {
      window.alert("Change the network to Goerli and try again");
      throw new Error("Change network to Goerli");
    }

    const accounts = await web3Provider.listAccounts();
    if (accounts) {
      setAccount(accounts[0]);
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };



  const disconnect = async () => {
    try {
      await web3ModalRef.current.clearCachedProvider();
      setWalletConnected(false);
      setIsOwner(false);
      setAccount("");
    } catch (err) {
      console.error(err);
    }
  }

   // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
  
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
        cacheProvider: true,
      });
      // if(!walletConnected) {
      //   connectWallet();
      // }
      // connectWallet();
      
     

      // set an interval to get the number of token Ids minted every 5 seconds
      
    
  }, []);

  useEffect(() => {
    if (mainProvider?.on) {
      const handleAccountsChanged = (accounts) => {
        console.log("accountsChanged", accounts);
        if (accounts) setAccount(accounts[0]);
      };

      const handleChainChanged = (_hexChainId) => {
        setMainChainId(_hexChainId);
        // if (mainChainId !== "0x5") {
        //   setWalletConnected(false);
        //   window.alert("Change the network to Goerli and try again");
        //   // throw new Error("Change network to Goerli");
        // } else if (mainChainId === "0x5") {
        //   setWalletConnected(true);
        // }
        if (_hexChainId === "0x5") {
          connectWallet();
        } else {
          disconnect();
          window.alert("Change the network to Goerli and try again");
        }
      }

      const handleDisconnect = () => {
        // console.log("disconnect");
        disconnect();
      }

      mainProvider.on("accountsChanged", handleAccountsChanged);
      mainProvider.on("chainChanged", handleChainChanged);
      mainProvider.on("disconnect", handleDisconnect);

      return () => {
        if (mainProvider.removeListener) {
          mainProvider.removeListener("accountsChanged", handleAccountsChanged);
          mainProvider.removeListener("chainChanged",handleChainChanged);
          mainProvider.removeListener("disconnect", handleDisconnect);
        }
      }
    }
  }, [mainProvider]);

  const GalleryModule = ({imageNumber, poem, poemName, poet}) => {
    if(imageNumber % 2 === 0) {
      return (
        <div className={styles.galleryModule1}>
          <div className={styles.imageModule}><img src={`/poemaigc/${imageNumber}.png`} className={styles.galleryImage}></img></div>
          <div className={styles.poemModule}>
            <p className={styles.poem}>{poem}</p>
            <p className={styles.poetModule}>——{poemName}·{poet}</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.galleryModule2}>
          <div className={styles.imageModule}><img src={`/poemaigc/${imageNumber}.png`} className={styles.galleryImage}></img></div>
          <div className={styles.poemModule}>
            <p className={styles.poem}>{poem}</p>
            <p className={styles.poetModule}>——{poemName}·{poet}</p>
          </div>
        </div>
      );
    }
    
  }

  const Gallery = () => {
    return (
      <div>
        <GalleryModule imageNumber={0} poem="接天莲叶无穷碧，映日荷花别样红。" poemName="《晓出净慈寺送林子方》" poet="杨万里"/>
        <GalleryModule imageNumber={1} poem="春江潮水连海平，海上明月共潮生。" poemName="《春江花月夜》" poet="张若虚"/>
        <GalleryModule imageNumber={2} poem="一道残阳铺水中，半江瑟瑟半江红。" poemName="《暮江吟》" poet="白居易"/>
        <GalleryModule imageNumber={3} poem="大漠沙如雪，燕山月似钩。" poemName="《马诗二十三首·其五》" poet="李贺"/>
        <GalleryModule imageNumber={4} poem="山随平野尽，江入大荒流。" poemName="《渡荆门送别》" poet="李白"/>
        <GalleryModule imageNumber={5} poem="落霞与孤鹜齐飞，秋水共长天一色。" poemName="《滕王阁序》" poet="王勃"/>
        <GalleryModule imageNumber={6} poem="明月松间照，清泉石上流。" poemName="《山居秋暝》" poet="王维"/>
        <GalleryModule imageNumber={7} poem="半亩方塘一鉴开，天光云影共徘徊。" poemName="《观书有感·其一》" poet="朱熹"/>
        <GalleryModule imageNumber={8} poem="日暮苍山远，天寒白屋贫。" poemName="《逢雪宿芙蓉山主人》" poet="刘长卿"/>
        <GalleryModule imageNumber={9} poem="海上生明月，天涯共此时。" poemName="《望月怀远》" poet="张九龄"/>
        <GalleryModule imageNumber={10} poem="采菊东篱下，悠然见南山。" poemName="《饮酒·其五》" poet="陶渊明"/>
        <GalleryModule imageNumber={11} poem="大漠孤烟直，长河落日圆。" poemName="《使至塞上》" poet="王维"/>
      </div>
    );
  }

  const MintModule = () => {
    if(!walletConnected || !account) {
      return (
        <div className={styles.recommend}>
          <p>Connect wallet and mint your favorite one as permanent collection</p>
          {renderButton()}
        </div>
      );
    } else {
      return (
        // <div>wallet connected {account} {mainChainId} {typeof mainChainId}</div>
        <BootstrapCarousel />
      );
    }
  }

 

  /*
      renderButton: Returns a button based on the state of the dapp
    */
  const renderTopButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wallet
    if (!walletConnected || !account) {
      return (
        <button onClick={connectWallet} className={styles.topButton1}>
          CONNECT WALLET
        </button>
      );
    } else {
      return (
        <button onClick={disconnect} className={styles.topButton2}>
          {account.slice(0,6)}&ensp;DISCONNECT
        </button>
      );
    }
  }

    const renderButton = () => {
      // If wallet is not connected, return a button which allows them to connect their wallet
     
        return (
          <button onClick={connectWallet} className={styles.connectButton}>
            Connect your wallet
          </button>
        );
  };

  const mintButton = (id,existence) => {
    if(loading) {
      return (
        <button className={styles.mintButton} disabled>Loading</button>
      );
    }
    if(existence) {
      return (
        <button className={styles.mintButton} disabled>minted</button>
      );
    }
    return <button className={styles.mintButton} onClick={() => {publicMint(id)}}>mint</button>;
  };

  const BootstrapCarousel = () => {
  //   const { bootstrap } = items;
  //   const [index, setIndex] = useState(0);
  //   const handleSelect = (selectedIndex, e) => {
  //   setIndex(selectedIndex);
  // };
  return (
    <Carousel activeIndex={index} onSelect={handleSelect} className={styles.carousel}>
      {bootstrap.map((item) => (
        <Carousel.Item key={item.id} className={styles.itemP} interval={20000}>
          <img src={item.imageUrl} alt="slides" />
          <Carousel.Caption className={styles.caption}>
            <div className={styles.captionFont}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
            {/* <button className="btn btn-danger" onClick={publicMint(item.id)}>mint</button> */}
            {/* <button className={styles.mintButton} onClick={() => {publicMint(item.id)}}>mint</button>  */}
            {mintButton(item.id,existenceArr[item.id])}
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
  }

  return (
    <div>
      <Head>
        <title>AIGC X POEM</title>
        <meta name="description" content="POEM X AIGC" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.topBar}>
        <img className={styles.logo} src="./logo.png" />
        <div className={styles.navDiv}>
          {renderTopButton()}
          </div>
      </div>
      <div className={styles.main}>
        <div className={styles.welcome}>
          <div><img src="welcome3.svg" className={styles.welcomeImage}></img></div>
        </div>
        <div>
          <img className={styles.image} src="./poemaigc/main.jpg" />
        </div>
      </div>

      <div className={styles.galleryLogo}>
        <img src="AIGC6.svg"></img>
      </div>
      {/* <div className={styles.galleryModule}>
        <div><img src={`/poemaigc/${fffff}.png`} width="512" height="320"></img></div>
        <div>
          <p>asdfg</p>
          <p>asdfgpoiu</p>
        </div>
      </div> */}
      {Gallery()}
      {MintModule()}
      {/* <div>{walletConnected.toString()}  {typeof existenceArr[0]} {existenceArr[6].toString()} {existenceArr[11].toString()} {loading.toString()}</div> */}
      {/* <button onClick={() => {publicMint(BigNumber.from(0))}}>mint</button>  */}
      {/* <button onClick={() => {publicMint(9)}} className={styles.mintButton} disabled>mint</button> */}

      <footer className={styles.footer}>
        <div>
          <a href="https://testnets.opensea.io/collection/poem-x-aigc-1" target="_blank">
            <img src="Logomark-Blue.svg" style={{width:40}}></img>
          </a>
        </div>
      </footer>
    </div>
  );
}