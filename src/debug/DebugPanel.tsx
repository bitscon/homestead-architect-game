import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { clearLogs, downloadLogs, getLogsJsonl, logEvent, setDebugRoute } from "./logger";

export function DebugPanel() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [marker, setMarker] = useState("");

  // keep logger route context synced
  useMemo(() => {
    setDebugRoute(location.pathname);
    return null;
  }, [location.pathname]);

  if (!import.meta.env.DEV) return null;

  const copy = async () => {
    if (!navigator.clipboard?.writeText) {
      console.warn('[DebugPanel] Clipboard API unavailable');
      // TODO: Show toast if available: toast?.error?.('Copy failed: Clipboard not available in this environment');
      return;
    }
    try {
      const txt = getLogsJsonl();
      await navigator.clipboard.writeText(txt);
      logEvent("logs_copied", { bytes: txt.length });
      // TODO: Show success toast if available: toast?.success?.('Logs copied to clipboard');
    } catch (error) {
      console.error('[DebugPanel] Clipboard write failed:', error);
      logEvent("logs_copy_failed", { reason: "clipboard_error", error: String(error) });
      // TODO: Show error toast if available: toast?.error?.('Copy failed: ' + (error as Error)?.message || 'Unknown error');
    }
  };

  const mark = () => {
    const msg = marker.trim() || "marker";
    logEvent("marker", { msg });
    setMarker("");
  };

  return (
    <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 9999 }}>
      {!open ? (
        <Button onClick={() => setOpen(true)} variant="secondary">
          Logs
        </Button>
      ) : (
        <Card className="p-3 w-[340px] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-sm">DEV Logs</div>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              ✕
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mb-2">
            Route: <span className="font-mono">{location.pathname}</span>
          </div>

          <div className="flex gap-2 mb-2">
            <Button size="sm" onClick={copy}>Copy</Button>
            <Button size="sm" variant="outline" onClick={() => downloadLogs()}>
              Download
            </Button>
            <Button size="sm" variant="destructive" onClick={() => { clearLogs(); logEvent("logs_cleared"); }}>
              Clear
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              value={marker}
              onChange={(e) => setMarker(e.target.value)}
              placeholder='Marker (e.g. "spinner on dashboard")'
            />
            <Button size="sm" variant="outline" onClick={mark}>
              Mark
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
