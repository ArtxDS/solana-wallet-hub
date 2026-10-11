import { SystemProgram, Transaction, PublicKey, Connection } from '@solana/web3.js';
import { getSolanaErrorMessage } from './errors';

export async function createSolTransferTransaction(
  connection: Connection,
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  lamports: number
): Promise<{ transaction: Transaction; estimatedFee: number }> {
  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      })
    );

    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = fromPubkey;

    const feeMessage = transaction.compileMessage();
    const feeCalculator = await connection.getFeeForMessage(feeMessage);
    const estimatedFee = feeCalculator.value || 5000;

    return { transaction, estimatedFee };
  } catch (error) {
    throw new Error(getSolanaErrorMessage(error));
  }
}
