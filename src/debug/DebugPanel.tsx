import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clearLogs, downloadLogs, getLogsJsonl, logEvent, setDebugRoute } from "./logger";

export function DebugPanel() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // keep logger route context synced
  useMemo(() => {
    setDebugRoute(location.pathname);
    return null;
  }, [location.pathname]);

  if (!import.meta.env.DEV) return null;

  const copy = async () => {
    try {
      const txt = getLogsJsonl();
      await navigator.clipboard.writeText(txt);
      logEvent("debug_panel", "logs_copied", { bytes: txt.length });
    } catch (error) {
      console.error('[DebugPanel] Clipboard write failed:', error);
      logEvent("debug_panel", "logs_copy_failed", { reason: "clipboard_error", error: String(error) });
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 9999 }}>
      {!open ? (
        <Button onClick={() => setOpen(true)} variant="secondary" size="sm">
          Logs
        </Button>
      ) : (
        <Card className="p-3 w-[280px] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-sm">DEV Logs</div>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              ✕
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mb-2">
            Route: <span className="font-mono">{location.pathname}</span>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={copy}>Copy</Button>
            <Button size="sm" variant="outline" onClick={() => downloadLogs()}>
              Download
            </Button>
            <Button size="sm" variant="destructive" onClick={() => { clearLogs(); logEvent("debug_panel", "logs_cleared"); }}>
              Clear
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
