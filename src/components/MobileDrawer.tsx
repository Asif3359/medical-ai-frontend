import React from "react";
import { IconX } from "./Icons";

export default function MobileDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white text-black border-r border-black transform transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-3 border-b border-black flex items-center justify-between">
          <span className="font-medium">Menu</span>
          <button onClick={onClose} aria-label="Close menu" className="p-1 hover:bg-black/5 rounded">
            <IconX />
          </button>
        </div>
        <div className="h-[calc(100%-49px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}


