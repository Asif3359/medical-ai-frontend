"use client";

import { useEffect, useMemo, useState } from "react";
import { getUserPredictions, logoutUser, type UserPredictionListItem } from "@/lib/api";
import { IconHistory, IconLogout, IconUser } from "./Icons";
import { STORAGE_KEYS } from "@/lib/config";

export default function Sidebar({ onLogout, onSelect, reloadSignal = 0 }: {
  onLogout?: () => void;
  onSelect?: (item: UserPredictionListItem) => void;
  reloadSignal?: number;
}) {
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [items, setItems] = useState<UserPredictionListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem(STORAGE_KEYS.userName));
    const storedEmail = localStorage.getItem(STORAGE_KEYS.userEmail);
    setEmail(storedEmail);
    async function load() {
      if (!storedEmail) return;
      setLoading(true);
      try {
        const list = await getUserPredictions({ email: storedEmail, limit: 50 });
        setItems(list);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reloadSignal]);

  const initials = useMemo(() => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((x) => x[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  }, [name]);

  function handleLogout() {
    logoutUser();
    onLogout?.();
  }

  return (
    <aside className="w-full md:w-64 border-r border-black h-full flex flex-col bg-white text-black">
      <div className="p-4 border-b border-black flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold select-none">
          {initials || <IconUser size={16} />}
        </div>
        <div className="truncate">
          <div className="font-medium truncate">{name || "User"}</div>
          <div className="text-xs text-black/60 truncate">{email || "—"}</div>
        </div>
      </div>
      <div className="p-3 text-xs uppercase tracking-wide text-black/60 flex items-center gap-2">
        <IconHistory />
        History
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="px-4 text-sm text-black/60">Loading...</div>
        )}
        {!loading && items.length === 0 ? (
          <div className="text-sm text-black/60 px-4">No predictions yet</div>
        ) : (
          <ul className="space-y-1 px-2">
            {items.map((it) => (
              <li key={it.prediction_id}>
                <button
                  className="w-full text-left px-2 py-1 rounded hover:bg-black/5"
                  onClick={() => onSelect?.(it)}
                >
                  <div className="text-sm font-medium truncate">{it.predicted_class}</div>
                  <div className="text-xs text-black/60">
                    {(it.confidence_score * 100).toFixed(1)}% • {new Date(it.created_at).toLocaleString()}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-4 border-t border-black">
        <button onClick={handleLogout} className="w-full border border-black rounded px-3 py-2 hover:bg-black/5 flex items-center justify-center gap-2">
          <IconLogout />
          Logout
        </button>
      </div>
    </aside>
  );
}


