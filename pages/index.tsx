import React, { useEffect, useState } from 'react';
// import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import HeadComponent from '../components/Head';
import Product from '../components/Product';

const App = () => {
  // This will fetch the users' public key (wallet address) from any wallet we support
  const { publicKey } = useWallet();

  interface Product {
    id: number;
    name: string;
    price: string;
    description: string;
    image_url: string;
    filename: string;
    hash: string;
  }
  const [products, setProducts] = useState<[Product] | []>([]);

  useEffect(() => {
    if (publicKey) {
      fetch(`/api/fetchProducts`)
        .then(response => response.json())
        .then(data => {
          setProducts(data);
          console.log("Products", data);
        });
    }
  }, [publicKey]);

  const renderNotConnectedContainer = () => (
    <div>
      <img src="https://pa1.narvii.com/5705/0fbd5c0899e2e59afda1547a7bda93cd87c81790_hq.gif" alt="emoji" />

      <div className="button-container">
        <WalletMultiButton className="cta-button connect-wallet-button" />
      </div>
    </div>
  );

  const renderItemBuyContainer = () => (
    <div className="products-container">
      {products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );

  return (
    <div className="App">
      <HeadComponent/>
      <div className="container">
        <header className="header-container">
          <p className="header"> 😳 Infinia's Images Store ⚡</p>
          <p className="sub-text">じゃんけんぽん</p>
        </header>

        <main>
          {publicKey ? renderItemBuyContainer() : renderNotConnectedContainer()}
        </main>

        <div className="footer-container">
          <a
            className="footer-text"
            href="infinia.space"
            target="_blank"
            rel="noreferrer"
          >{`infinia.space`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
