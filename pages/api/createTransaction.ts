import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import BigNumber from "bignumber.js";
import products from "./products.json";

// This is the token address of the USDC token on the devnet that we got from the faucet. We're going to use this address to find the USDC token account addresses.
const usdcAddress = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
const sellerAddress = '9YdKh6ixK2pyCPyeKckSDMKbCh4KkmSPmHCeBTapcHhh'
const sellerPublicKey = new PublicKey(sellerAddress);

const createTransaction = async (req: { method?: "POST" | "GET"; body: { buyer: string, orderID: string, itemID: number }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message?: string; transaction?: string; error?: string; }): void; new(): any; }; }; }) => {
  try {
    // Extract the transaction data from the request body
    const { buyer, orderID, itemID } = req.body;

    // If we don't have something we need, stop!
    if (!buyer) {
      res.status(400).json({
        message: "Missing buyer address",
      });
    }

    if (!orderID) {
      res.status(400).json({
        message: "Missing order ID",
      });
    }

    if (!products || products.length < 1) {
      return res.status(400).json({
        message: "No products found",
      });
    }
    // Fetch item price from products.json using itemID
    const itemPrice = products.find((item) => item.id === itemID)!.price;

    if (!itemPrice) {
      res.status(404).json({
        message: "Item not found. please check item ID",
      });
    }

    // Convert our price to the correct format
    const bigAmount = new BigNumber(itemPrice);
    const buyerPublicKey = new PublicKey(buyer);
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const connection = new Connection(endpoint);

    const buyerUsdcAddress = await getAssociatedTokenAddress(usdcAddress, buyerPublicKey);
    const shopUsdcAddress = await getAssociatedTokenAddress(usdcAddress, sellerPublicKey);
    // A blockhash is sort of like an ID for a block. It lets you identify each block.
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");

    // This is new, we're getting the mint address of the token we want to transfer
    const usdcMint = await getMint(connection, usdcAddress);

    // The first two things we need - a recent block ID
    // and the public key of the fee payer
    const tx = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: buyerPublicKey,
    });

    const amount = bigAmount.toNumber() * 10 ** usdcMint.decimals;

    // Here we're creating a different type of transfer instruction
    const transferInstruction = createTransferCheckedInstruction(
      buyerUsdcAddress,
      usdcAddress,     // This is the address of the token we want to transfer
      shopUsdcAddress,
      buyerPublicKey,
      amount,
      usdcMint.decimals // The token could have any number of decimals
    );

    // We're adding more instructions to the transaction
    transferInstruction.keys.push({
      // We'll use our OrderId to find this transaction later
      pubkey: new PublicKey(orderID),
      isSigner: false,
      isWritable: false,
    });

    tx.add(transferInstruction);

    // Formatting our transaction
    const serializedTransaction = tx.serialize({
      requireAllSignatures: false,
    });
    const base64 = serializedTransaction.toString("base64");

    res.status(200).json({
      transaction: base64,
      message: `Amount: ${amount}`,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "error creating tx" });
    return;
  }
}

export default function handler(req: { method?: "POST"; body: { buyer: string; orderID: string; itemID: number; }; }, res: { status: any; }) {
  if (req.method === "POST") {
    createTransaction(req, res);
  } else {
    res.status(405).end();
  }
}
