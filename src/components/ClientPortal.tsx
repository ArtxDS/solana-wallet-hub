"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ClientPortalProps = {
  children: React.ReactNode;
};

export function ClientPortal({ children }: ClientPortalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // The portal target only exists in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return createPortal(children, document.body);
}
