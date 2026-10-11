import { CheckCircle2, ExternalLink, X } from "lucide-react";

type SuccessToastProps = {
  explorerUrl: string;
  onClose?: () => void;
};

export function SuccessToast({ explorerUrl, onClose }: SuccessToastProps) {
  return (
    <div className="flex w-[min(380px,calc(100vw-32px))] items-start gap-3 rounded-2xl border border-positive/25 bg-[#171026] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-positive" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">Transação confirmada</p>
        <a href={explorerUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-secondary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          Ver no Explorer <ExternalLink size={12} />
        </a>
      </div>
      {onClose ? <button type="button" onClick={onClose} aria-label="Fechar notificação" className="rounded-md p-1 text-muted hover:bg-white/[0.07] hover:text-white"><X size={14} /></button> : null}
    </div>
  );
}
