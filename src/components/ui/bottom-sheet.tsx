"use client";

import { ClientPortal } from "@/components/ClientPortal";
import { cn } from "@/utils/cn";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { Suspense, useEffect, useRef } from "react";

type BottomSheetProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
  customBg?: string;
  bgIndicator?: string;
  overlayClassName?: string;
  panelStyle?: CSSProperties;
};

export function BottomSheet({
  open,
  onClose,
  children,
  className,
  panelClassName,
  customBg,
  bgIndicator,
  overlayClassName,
  panelStyle,
}: BottomSheetProps) {
  const dragControls = useDragControls();
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const { body } = document;
    scrollYRef.current = window.scrollY;

    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.width = "100%";
    html.classList.add("overflow-hidden");

    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      html.classList.remove("overflow-hidden");
      window.scrollTo(0, scrollYRef.current);
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, open]);

  const stopTouchPropagation = (event: React.TouchEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleIndicatorPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    dragControls.start(event);
  };

  return (
    <ClientPortal>
      <Suspense fallback={null}>
        <AnimatePresence>
          {open ? (
            <div
              className="fixed inset-0 z-[99990] lg:hidden"
              onTouchStart={stopTouchPropagation}
              onTouchMove={stopTouchPropagation}
              onTouchEnd={stopTouchPropagation}
              onTouchCancel={stopTouchPropagation}
              onWheel={(event) => event.stopPropagation()}
            >
              <motion.button
                type="button"
                aria-label="Fechar formulário de envio"
                className={cn(
                  "fixed inset-0 h-full w-full cursor-default border-0 bg-black/60 p-0 backdrop-blur-[2px]",
                  overlayClassName,
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                onClick={onClose}
              />

              <motion.section
                role="dialog"
                aria-modal="true"
                aria-label="Formulário de envio de SOL"
                drag="y"
                dragListener={false}
                dragControls={dragControls}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.12}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 24 || info.velocity.y > 220) onClose();
                }}
                className={cn(
                  "fixed inset-x-0 bottom-0 z-[99999] max-h-[calc(100dvh-4.5rem)] overflow-hidden rounded-t-3xl border border-b-0 border-white/[0.08] bg-[#16181d] shadow-[0_-18px_70px_rgba(0,0,0,0.5),0_0_40px_rgba(153,69,255,0.12)]",
                  customBg,
                  panelClassName,
                )}
                style={panelStyle}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
              >
                <div
                  className={cn(
                    "max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain bg-[#16181d] px-3 py-2.5 pb-[calc(2.5rem+env(safe-area-inset-bottom))]",
                    className,
                  )}
                >
                  <div
                    className="flex justify-center pt-2"
                    style={{ touchAction: "none" }}
                    onPointerDown={handleIndicatorPointerDown}
                  >
                    <div
                      className={cn(
                        "mx-auto mb-4 h-1.5 w-[60px] rounded-full bg-white/35",
                        bgIndicator,
                      )}
                    />
                  </div>
                  {children}
                </div>
              </motion.section>
            </div>
          ) : null}
        </AnimatePresence>
      </Suspense>
    </ClientPortal>
  );
}

export default BottomSheet;
