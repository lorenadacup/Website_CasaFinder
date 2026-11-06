import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type NotifType = "success" | "error" | "warning" | "info";

export interface NotifOptions {
  type: NotifType;
  title: string;
  message: string;
  autoDismiss?: number;
  // Confirm mode (shows Cancel + Confirm buttons)
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: (inputValue?: string) => void;
  // Optional text input inside the dialog
  inputLabel?: string;
  inputPlaceholder?: string;
  inputRequired?: boolean;
}

interface AppNotificationProps {
  notif: NotifOptions | null;
  onClose: () => void;
}

const CONFIG: Record<NotifType, {
  icon: React.ReactNode;
  headerClass: string;
  borderColor: string;
}> = {
  success: {
    icon: <CheckCircle className="w-7 h-7 text-white" />,
    headerClass: "from-emerald-600 to-teal-600",
    borderColor: "border-emerald-300",
  },
  error: {
    icon: <XCircle className="w-7 h-7 text-white" />,
    headerClass: "from-red-600 to-rose-600",
    borderColor: "border-red-300",
  },
  warning: {
    icon: <AlertTriangle className="w-7 h-7 text-white" />,
    headerClass: "from-amber-500 to-orange-500",
    borderColor: "border-amber-300",
  },
  info: {
    icon: <Info className="w-7 h-7 text-white" />,
    headerClass: "from-indigo-600 to-violet-600",
    borderColor: "border-indigo-300",
  },
};

export default function AppNotification({ notif, onClose }: AppNotificationProps) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue("");
  }, [notif]);

  useEffect(() => {
    if (!notif?.autoDismiss || notif.onConfirm) return;
    const t = setTimeout(onClose, notif.autoDismiss);
    return () => clearTimeout(t);
  }, [notif, onClose]);

  if (!notif) return null;

  const cfg = CONFIG[notif.type];
  const isConfirm = !!notif.onConfirm;
  const hasInput = !!notif.inputLabel;

  const handleConfirm = () => {
    if (hasInput && notif.inputRequired && !inputValue.trim()) return;
    notif.onConfirm?.(inputValue.trim() || undefined);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={isConfirm ? undefined : onClose}
    >
      <div
        className={`relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border ${cfg.borderColor} overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${cfg.headerClass} px-5 py-4 flex items-center gap-3`}>
          <div className="bg-white/20 rounded-full p-1.5">
            {cfg.icon}
          </div>
          <h3 className="text-white font-bold text-base leading-tight flex-1">
            {notif.title}
          </h3>
          {!isConfirm && (
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Message */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">
            {notif.message}
          </p>
        </div>

        {/* Optional text input */}
        {hasInput && (
          <div className="px-5 pb-2 space-y-1">
            <label className="text-xs font-semibold text-stone-600">
              {notif.inputLabel}
              {notif.inputRequired && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={notif.inputPlaceholder ?? ""}
              rows={3}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none"
              autoFocus
            />
          </div>
        )}

        {/* Buttons */}
        <div className="px-5 pb-5 pt-2 flex gap-2">
          {isConfirm ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-sm transition-all active:scale-95"
              >
                {notif.cancelLabel ?? "Cancel"}
              </button>
              <button
                onClick={handleConfirm}
                disabled={hasInput && notif.inputRequired && !inputValue.trim()}
                className={`flex-1 bg-gradient-to-r ${cfg.headerClass} text-white font-semibold py-2.5 px-4 rounded-xl text-sm shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {notif.confirmLabel ?? "Confirm"}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={`w-full bg-gradient-to-r ${cfg.headerClass} text-white font-semibold py-2.5 rounded-xl text-sm shadow-md hover:opacity-90 active:scale-95 transition-all`}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
