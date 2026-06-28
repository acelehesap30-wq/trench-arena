import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

// The House Vault - This is a mock address for Devnet testing.
// In production, this would be a PDA (Program Derived Address) of your Anchor Program.
export const HOUSE_VAULT_ADDRESS = new PublicKey("11111111111111111111111111111111");

/**
 * Creates a transaction to transfer SOL from user to the House vault.
 */
export const createBetTransaction = async (
    connection: Connection,
    userPublicKey: PublicKey,
    amountInSol: number
): Promise<Transaction> => {
    const lamports = Math.round(amountInSol * 1_000_000_000); // 1 SOL = 10^9 Lamports

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: userPublicKey,
            toPubkey: HOUSE_VAULT_ADDRESS,
            lamports,
        })
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPublicKey;

    return transaction;
};
