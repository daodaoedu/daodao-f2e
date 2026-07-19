"use client";

import { useEffect, useState } from "react";

/**
 * 島嶼 WebGL 現場診斷覆蓋層（暫時性）。
 *
 * 用於追「iOS Safari 上模型貼圖全白，桌面正常」的問題：直接把 renderer 能力、
 * 資源用量、context 遺失、以及每張 baseColorTexture 的「已解碼 / 已上傳 GPU」
 * 數字顯示在畫面上，讓實機（iPhone）不必接 Web Inspector 就能回報真實狀態。
 *
 * 僅在網址帶 `?diag=1` 時由父層掛載，一般使用者不會看到。
 */

type DiagnosticsSnapshot = Record<string, string | number | boolean>;

interface IslandDiagnosticsProps {
  getSnapshot: () => DiagnosticsSnapshot | null;
}

export function IslandDiagnostics({ getSnapshot }: IslandDiagnosticsProps) {
  const [snapshot, setSnapshot] = useState<DiagnosticsSnapshot | null>(null);

  useEffect(() => {
    const tick = () => setSnapshot(getSnapshot());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [getSnapshot]);

  if (!snapshot) return null;

  return (
    <div className="pointer-events-none absolute top-28 left-2 z-50 max-w-[calc(100vw-1rem)] rounded-md bg-black/75 p-2 font-mono text-[10px] leading-tight text-lime-300 shadow-lg">
      <div className="mb-1 font-bold text-white">island webgl diag</div>
      {Object.entries(snapshot).map(([key, value]) => (
        <div key={key}>
          {key}: <span className="text-white">{String(value)}</span>
        </div>
      ))}
    </div>
  );
}
