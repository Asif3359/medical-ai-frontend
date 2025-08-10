"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Uploader from "@/components/Uploader";
import ResultsPanel from "@/components/ResultsPanel";
import type { PredictResponse } from "@/lib/api";
import type { UserPredictionListItem } from "@/lib/api";
// import { getUserPredictions } from "@/lib/api";
import { PREDICTION_IMAGE_URL_TEMPLATE } from "@/lib/config";
import { STORAGE_KEYS } from "@/lib/config";
import MobileDrawer from "@/components/MobileDrawer";
import { IconMenu } from "@/components/Icons";

export default function Home() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [selected, setSelected] = useState<UserPredictionListItem | null>(null);
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [historyReload, setHistoryReload] = useState(0);
  // const [predictions, setPredictions] = useState<UserPredictionListItem[]>([]);
  // const [predictionsLoading, setPredictionsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.accessToken);
    if (token) {
      setIsAuthed(true);
    } else {
      router.replace("/auth");
    }
  }, [router]);

  // Shared predictions loading effect
  useEffect(() => {
    if (!isAuthed) return;
    
    const email = localStorage.getItem(STORAGE_KEYS.userEmail);
    if (!email) return;

    // async function loadPredictions() {
    //   setPredictionsLoading(true);
    //   try {
    //     const list = await getUserPredictions({ email: email as string, limit: 50 });
    //     setPredictions(list);
    //     console.log(list);
    //   } catch (error) {
    //     console.error('Failed to load predictions:', error);
    //   } finally {
    //     setPredictionsLoading(false);
    //   }
    // }

    // loadPredictions();
  }, [isAuthed, historyReload]);



  const content = useMemo(() => {
    if (!isAuthed) return null;

    return (
      <div className="min-h-screen grid grid-rows-[auto_1fr] md:grid-cols-[256px_1fr_420px] bg-white text-black">
        {/* Mobile top bar */}
        <div className="md:hidden col-span-full border-b border-black p-3 flex items-center justify-between">
          <button
            aria-label="Open menu"
            className="p-2 rounded hover:bg-black/5"
            onClick={() => setDrawerOpen(true)}
          >
            <IconMenu />
          </button>
          <div className="font-medium">Chest X-ray Diagnosis</div>
          <div className="w-9" />
        </div>

        {/* Sidebar persistent on md+ */}
        <div className="hidden md:block md:row-span-2">
          <Sidebar
            onLogout={() => {
              setIsAuthed(false);
              router.replace("/auth");
            }}
            // predictions={predictions}
            // loading={predictionsLoading}
            reloadSignal={historyReload}
            onSelect={(item) => {
              setSelected(item);
              // If item includes all_predictions, reflect into result panel
              if (item.all_predictions) {
                setResult({
                  prediction_id: item.prediction_id,
                  predicted_class: item.predicted_class,
                  confidence_score: item.confidence_score,
                  all_predictions: item.all_predictions,
                  processing_time: item.processing_time,
                  created_at: item.created_at,
                });
              }
            }}
          />
        </div>

        {/* Mobile drawer */}
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Sidebar
            onLogout={() => {
              setIsAuthed(false);
              setDrawerOpen(false);
              router.replace("/auth");
            }}
            // predictions={predictions}
            // loading={predictionsLoading}
            reloadSignal={historyReload}
            isVisible={drawerOpen}
            onSelect={(item) => {
              setSelected(item);
              if (item.all_predictions) {
                setResult({
                  prediction_id: item.prediction_id,
                  predicted_class: item.predicted_class,
                  confidence_score: item.confidence_score,
                  all_predictions: item.all_predictions,
                  processing_time: item.processing_time,
                  created_at: item.created_at,
                });
              }
              setDrawerOpen(false);
            }}
          />
        </MobileDrawer>

        {/* Main content */}
        <main className="p-4 md:p-6">
          <h1 className="hidden md:block text-2xl font-semibold mb-4">Chest X-ray Diagnosis</h1>
          <Uploader
            onResult={(r) => {
              setResult(r);
              setHistoryReload((v) => v + 1);
            }}
            externalImageUrl={
              selected?.image_url || (selected?.prediction_id
                ? PREDICTION_IMAGE_URL_TEMPLATE.replace("{id}", selected.prediction_id)
                : null)
            }
          />
          {/* Mobile results below uploader */}
          <div className="md:hidden mt-6 border-t border-black pt-4">
            <ResultsPanel result={result} />
          </div>
        </main>
        <aside className="hidden md:block p-6 border-l border-black h-screen">
          <ResultsPanel result={result} />
        </aside>
      </div>
    );
  }, [isAuthed, result, router, drawerOpen, selected?.image_url, selected?.prediction_id, historyReload]);

  return content;
}
