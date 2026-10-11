"use client";

import { HistoryList } from "@/components/history/HistoryList";
import { useSolanaNetwork } from "@/components/providers/SolanaProvider";
import { ConfirmationModal } from "@/components/send/ConfirmationModal";
import { SendForm } from "@/components/send/SendForm";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SuccessToast } from "@/components/ui/success-toast";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { WalletCard } from "@/components/wallet/WalletCard";
import { useSolanaBalance } from "@/hooks/useSolanaBalance";
import { useSolPrice } from "@/hooks/useSolPrice";
import type { HistoryItem } from "@/hooks/useTransactionHistory";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { getExplorerUrl, type SolanaNetwork } from "@/lib/solana/config";
import { getSolanaErrorUserMessage } from "@/lib/solana/errorMessages";
import { formatLamportsToSol } from "@/lib/solana/format";
import { createSolTransferTransaction } from "@/lib/solana/transactions";
import type { SendPreview } from "@/types/send";
import type { TransactionRecord } from "@/types/transaction";
import type { WalletSnapshot } from "@/types/wallet";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, type PublicKey as PublicKeyType } from "@solana/web3.js";
import axios from "axios";
import { LogOut, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type WalletHubView = "overview" | "balance" | "wallet" | "history";

type WalletHubProps = {
  view?: WalletHubView;
  sendDefaults?: {
    destination: string;
    amount: string;
  };
};

const defaultSendDefaults = {
  destination: "",
  amount: "",
};

function formatTransactionDate(blockTime: number | null) {
  if (!blockTime) return "Data indisponível";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(blockTime * 1000);
}

function toTransactionRecord(
  item: HistoryItem,
  owner: PublicKeyType | null,
  network: SolanaNetwork,
): TransactionRecord | null {
  if (!owner || !item.details?.meta) return null;

  const accountKeys = item.details.transaction.message.accountKeys;
  const ownerIndex = accountKeys.findIndex(({ pubkey }) =>
    pubkey.equals(owner),
  );
  if (ownerIndex < 0) return null;

  const balanceDelta =
    (item.details.meta.postBalances[ownerIndex] ?? 0) -
    (item.details.meta.preBalances[ownerIndex] ?? 0);
  const counterparty = accountKeys
    .find(({ pubkey }) => !pubkey.equals(owner))
    ?.pubkey.toBase58();
  const received = balanceDelta >= 0;

  return {
    id: item.signature,
    type: received ? "received" : "sent",
    value:
      (received ? "+" : "−") +
      " " +
      formatLamportsToSol(Math.abs(balanceDelta)) +
      " SOL",
    counterparty: counterparty
      ? counterparty.slice(0, 4) + "..." + counterparty.slice(-4)
      : "Endereço não identificado",
    date: formatTransactionDate(item.blockTime),
    status: item.status === "success" ? "confirmed" : "failed",
    signature: item.signature,
    explorerUrl: getExplorerUrl("tx", item.signature, network),
  };
}

export function WalletHub({
  view = "overview",
  sendDefaults = defaultSendDefaults,
}: WalletHubProps) {
  const {
    connected,
    publicKey,
    wallet: selectedWallet,
    disconnect,
    sendTransaction,
  } = useWallet();
  const { connection } = useConnection();
  const { network, networkLabel, isMainnet } = useSolanaNetwork();
  const {
    balance: onChainBalance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useSolanaBalance();
  const { priceUsd: solPriceUsd } = useSolPrice();
  const {
    history,
    isLoading: isHistoryLoading,
    refetch,
  } = useTransactionHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSendSheetOpen, setIsSendSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendFormResetKey, setSendFormResetKey] = useState(0);
  const [pendingTransfer, setPendingTransfer] = useState<{
    destination: string;
    lamports: number;
  } | null>(null);
  const [sendPreview, setSendPreview] = useState<SendPreview>({
    destination: "",
    amount: "",
    asset: "SOL",
    fee: "",
    total: "",
  });

  const activeWallet: WalletSnapshot = useMemo(() => {
    const address = publicKey?.toBase58() ?? "";

    return {
      isConnected: Boolean(connected && publicKey),
      name: selectedWallet?.adapter.name ?? "Carteira",
      address,
      shortAddress: address
        ? address.slice(0, 4) + "..." + address.slice(-4)
        : "",
      balance:
        onChainBalance === null
          ? "— SOL"
          : formatLamportsToSol(onChainBalance) + " SOL",
      balanceCaption: "Saldo disponível na " + networkLabel,
      network,
    };
  }, [
    connected,
    network,
    networkLabel,
    onChainBalance,
    publicKey,
    selectedWallet,
  ]);

  const transactions = useMemo(
    () =>
      history
        .map((item) => toTransactionRecord(item, publicKey, network))
        .filter((item): item is TransactionRecord => item !== null),
    [history, network, publicKey],
  );

  const copyAddress = async () => {
    await navigator.clipboard?.writeText(activeWallet.address);
    setCopied(true);
    toast.success("Endereço copiado");
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleReview = async (destination: string, amount: string) => {
    const parsedAmount = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || !publicKey) {
      return;
    }

    const lamports = Math.round(parsedAmount * 1e9);
    let feeLamports = 5000; // safe fallback
    let feeString = "0,000005 SOL";

    try {
      const { estimatedFee } = await createSolTransferTransaction(
        connection,
        publicKey,
        new PublicKey(destination),
        lamports,
      );
      feeLamports = estimatedFee;
      const feeSol = feeLamports / 1e9;
      feeString = `${feeSol.toLocaleString("pt-BR", { maximumFractionDigits: 9 })} SOL`;
    } catch {}

    const totalSol = parsedAmount + feeLamports / 1e9;
    const totalString = `${totalSol.toLocaleString("pt-BR", { maximumFractionDigits: 9 })} SOL`;

    setPendingTransfer({ destination, lamports });
    setSendPreview({
      destination,
      amount: `${amount} SOL`,
      asset: "SOL",
      fee: feeString,
      total: totalString,
    });
    setIsSendSheetOpen(false);
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!publicKey || !pendingTransfer || isSending) return;

    setIsSending(true);
    try {
      const { transaction } = await createSolTransferTransaction(
        connection,
        publicKey,
        new PublicKey(pendingTransfer.destination),
        pendingTransfer.lamports,
      );

      const signature = await sendTransaction(transaction, connection);

      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed",
      );

      setIsModalOpen(false);
      setPendingTransfer(null);
      if (isMainnet) {
        setSendFormResetKey((key) => key + 1);
      }

      await Promise.all([refetchBalance(), refetch()]);

      toast.custom(
        (toastId) => (
          <SuccessToast
            explorerUrl={getExplorerUrl("tx", signature, network)}
            onClose={() => toast.dismiss(toastId)}
          />
        ),
        { duration: 7000 },
      );
    } catch (error) {
      console.error("[send] transaction failed:", error);
      toast.error("Falha no envio", {
        description: getSolanaErrorUserMessage(error),
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Carteira desconectada");
    } catch {
      toast.error("Erro ao desconectar a carteira");
    }
  };

  const handleAirdrop = async () => {
    if (isMainnet) {
      toast.error("Airdrop disponível apenas na Devnet.");
      return;
    }

    if (!publicKey) {
      toast.error("Conecte uma carteira antes de pedir o airdrop.");
      return;
    }

    setIsAirdropping(true);

    try {
      const { data: payload } = await axios.post<{
        amount?: number;
        error?: string;
      }>("/api/faucet", {
        address: publicKey.toBase58(),
      });

      await Promise.all([refetchBalance(), refetch()]);

      toast.success("Airdrop recebido", {
        description: `${payload.amount ?? 0.08} SOL foi adicionado à sua carteira na Devnet.`,
      });
    } catch (error) {
      console.error("Airdrop request failed", error);
      let message = "Tente novamente mais tarde.";

      if (axios.isAxiosError<{ error?: string }>(error)) {
        const status = error.response?.status;
        const apiMessage = error.response?.data?.error;

        if (status === 429) {
          message = apiMessage ?? "Você já solicitou SOL recentemente.";
        } else if (status === 503) {
          message = "Faucet sem fundos no momento.";
        } else {
          message = apiMessage ?? "Não foi possível solicitar SOL agora.";
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error("Não foi possível solicitar o airdrop", {
        description: message,
      });
    } finally {
      setIsAirdropping(false);
    }
  };

  const renderSendForm = (className = "") => (
    <SendForm
      key={sendFormResetKey}
      solBalance={onChainBalance}
      initialDestination={sendDefaults.destination}
      initialAmount={sendDefaults.amount}
      onReview={handleReview}
      networkLabel={networkLabel}
      className={className}
    />
  );

  if (view !== "overview") {
    const pageContent = {
      balance: {
        kicker: "Carteira",
        title: "Saldo",
        description: isMainnet
          ? `Acompanhe seu saldo real na ${networkLabel}.`
          : `Acompanhe seu saldo real na ${networkLabel} e solicite SOL de teste.`,
      },
      wallet: {
        kicker: "Conta conectada",
        title: "Carteira",
        description: "Confira o endereço conectado e gerencie sua sessão.",
      },
      history: {
        kicker: "Movimentações",
        title: "Histórico",
        description: `Veja as transações recentes desta carteira na ${networkLabel}.`,
      },
    }[view];

    return (
      <>
        <div className="app-shell">
          <section className="mb-6 max-w-2xl">
            <p className="section-kicker">{pageContent.kicker}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
              {pageContent.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted sm:text-[15px]">
              {pageContent.description}
            </p>
          </section>

          {!activeWallet.isConnected ? (
            <div className="flex min-h-52 max-w-2xl flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
              <p className="text-muted">Nenhuma carteira conectada</p>
              <p className="mt-2 text-sm text-muted/70">
                Conecte sua carteira pelo botão no topo para acessar esta área.
              </p>
            </div>
          ) : view === "balance" ? (
            <div className="max-w-2xl space-y-4">
              <BalanceCard
                wallet={activeWallet}
                onAirdrop={handleAirdrop}
                isLoading={isBalanceLoading && onChainBalance === null}
                isAirdropping={isAirdropping}
                isAirdropAvailable={!isMainnet}
                solBalance={onChainBalance}
                solPriceUsd={solPriceUsd}
              />
              <Card className="min-[640px]:hidden">
                <CardContent className="flex flex-col gap-4 p-4">
                  <div>
                    <p className="section-kicker">Movimentar ativos</p>
                    <p className="mt-2 text-base font-semibold text-white">
                      Enviar SOL para outra carteira
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Preencha o endereço e o valor no formulário de envio.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setIsSendSheetOpen(true)}
                    className="min-h-11 w-full border border-primary/25"
                  >
                    <Send size={16} />
                    Enviar SOL
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : view === "wallet" ? (
            <div className="max-w-2xl space-y-4">
              <WalletCard
                wallet={activeWallet}
                copied={copied}
                onCopy={copyAddress}
              />
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="min-h-12 w-full border-danger/30 text-danger hover:border-danger/50 hover:bg-danger/10 hover:text-danger"
              >
                <LogOut size={17} />
                Desconectar carteira
              </Button>
            </div>
          ) : (
            <div className="max-w-2xl">
              <HistoryList
                transactions={transactions}
                isLoading={isHistoryLoading}
                networkLabel={networkLabel}
              />
            </div>
          )}
        </div>

        {view === "balance" ? (
          <>
            <BottomSheet
              open={isSendSheetOpen}
              title="Enviar SOL"
              onClose={() => setIsSendSheetOpen(false)}
            >
              {renderSendForm("mobile-send-sheet-card !bg-[#16181d]")}
            </BottomSheet>
            <ConfirmationModal
              open={isModalOpen}
              preview={sendPreview}
              onClose={() => setIsModalOpen(false)}
              onConfirm={handleConfirm}
              networkLabel={networkLabel}
              solBalance={onChainBalance}
              isSending={isSending}
            />
          </>
        ) : null}
      </>
    );
  }

  return (
    <div className="app-shell">
      <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="section-kicker">Painel da carteira</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
            Visão geral
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted sm:text-[15px]">
            Gerencie seus ativos, envie SOL e acompanhe suas movimentações na
            rede {networkLabel}.
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 self-start rounded-full border border-white/8 bg-white/2.5 px-3 py-2 text-xs text-muted md:self-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-positive shadow-[0_0_8px_rgba(20,241,149,0.8)]" />
          Dados atualizados agora
        </div>
      </section>

      <div className="grid items-start gap-5 min-[900px]:grid-cols-[minmax(0,1fr)_340px] lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-5">
          {!activeWallet.isConnected ? (
            <div className="flex h-50 flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-center p-6">
              <p className="text-muted">Nenhuma carteira conectada</p>
              <p className="mt-2 text-sm text-muted/70">
                Conecte sua carteira para ver seus ativos e realizar transações.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 min-[900px]:grid-cols-2">
                <BalanceCard
                  wallet={activeWallet}
                  onAirdrop={handleAirdrop}
                  isLoading={isBalanceLoading && onChainBalance === null}
                  isAirdropping={isAirdropping}
                  isAirdropAvailable={!isMainnet}
                  solBalance={onChainBalance}
                  solPriceUsd={solPriceUsd}
                />
                <WalletCard
                  wallet={activeWallet}
                  copied={copied}
                  onCopy={copyAddress}
                />
              </div>
              <HistoryList
                transactions={transactions}
                isLoading={isHistoryLoading}
                networkLabel={networkLabel}
              />
            </>
          )}
        </div>

        <aside
          className="hidden min-w-0 self-start min-[640px]:block min-[900px]:sticky min-[900px]:top-24"
          aria-label="Painel de envio"
        >
          <div className="send-panel-scroll">
            {renderSendForm("send-panel-card")}
          </div>
        </aside>
      </div>

      <Button
        variant="primary"
        className="mobile-send-fab fixed right-5 z-30 min-h-12 rounded-full px-5 shadow-[0_8px_30px_rgba(0,0,0,0.32),0_0_28px_rgba(153,69,255,0.3)] min-[640px]:hidden"
        aria-label="Abrir formulário Enviar"
        onClick={() => setIsSendSheetOpen(true)}
      >
        <Send size={17} />
        Enviar
      </Button>

      <BottomSheet
        open={isSendSheetOpen}
        title="Enviar"
        onClose={() => setIsSendSheetOpen(false)}
      >
        {renderSendForm("mobile-send-sheet-card !bg-[#16181d]")}
      </BottomSheet>

      <ConfirmationModal
        open={isModalOpen}
        preview={sendPreview}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        networkLabel={networkLabel}
        solBalance={onChainBalance}
        isSending={isSending}
      />
    </div>
  );
}
