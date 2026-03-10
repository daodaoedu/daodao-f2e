"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_INCOMING_REQUESTS = [
  {
    id: "r1",
    userId: "u10",
    name: "Mia Lin",
    photoURL: "https://i.pravatar.cc/40?img=9",
    description: "以設計的身份在教育產業浮沈多年，現在正在念研究所專心當學生。",
    connectReason: "我很欣賞你分享的學習方式，想跟你多交流！",
  },
  {
    id: "r2",
    userId: "u11",
    name: "Kevin Huang",
    photoURL: "https://i.pravatar.cc/40?img=15",
    description: "在科技公司做產品，下班後用閱讀和寫作保持清醒。",
    connectReason: "看了你的實踐紀錄很有共鳴，希望可以互相鼓勵。",
  },
];

const MOCK_OUTGOING_REQUESTS = [
  {
    id: "r3",
    userId: "u12",
    name: "Chloe Wu",
    photoURL: "https://i.pravatar.cc/40?img=20",
    description: "正在挑戰一年學會日文，用輸出逼自己真的學進去。",
    status: "pending" as const,
  },
];

const MOCK_CONNECTIONS = [
  {
    id: "c1",
    userId: "u1",
    name: "Sarah Chen",
    photoURL: "https://i.pravatar.cc/40?img=5",
    description: "UX 設計師，相信好的設計能讓學習變得更自然。",
  },
  {
    id: "c2",
    userId: "u2",
    name: "Alex Wang",
    photoURL: "https://i.pravatar.cc/40?img=12",
    description: "白天寫程式，晚上自學音樂，想用技術做出有溫度的東西。",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export const ConnectionsSettings = () => {
  const [incomingRequests, setIncomingRequests] = useState(MOCK_INCOMING_REQUESTS);
  const [outgoingRequests, setOutgoingRequests] = useState(MOCK_OUTGOING_REQUESTS);
  const [connections, setConnections] = useState(MOCK_CONNECTIONS);
  const { openWarningDialog } = useDialog();

  const handleAccept = (id: string) => {
    const req = incomingRequests.find((r) => r.id === id);
    if (!req) return;
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
    setConnections((prev) => [
      ...prev,
      { id: req.id, userId: req.userId, name: req.name, photoURL: req.photoURL, description: req.description },
    ]);
    toast.success(`已與 ${req.name} 成為夥伴`);
  };

  const handleIgnore = async (id: string, name: string) => {
    const result = await openWarningDialog({
      title: "忽略連結請求？",
      message: `確定要忽略來自 ${name} 的連結請求嗎？`,
      textAlign: "left",
      buttons: [
        { label: "忽略", value: "confirm", variant: "outline" },
        { label: "先不要", value: "cancel", variant: "orange" },
      ],
    });
    if (result.value !== "confirm") return;
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success("已忽略連結請求");
  };

  const handleWithdraw = (id: string) => {
    setOutgoingRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success("已撤回連結請求");
  };

  const handleDisconnect = async (id: string, name: string) => {
    const result = await openWarningDialog({
      title: "解除連結？",
      message: `解除連結後，你與 ${name} 將失去對彼此非公開內容的存取權。`,
      textAlign: "left",
      buttons: [
        { label: "解除連結", value: "confirm", variant: "outline" },
        { label: "先不要", value: "cancel", variant: "orange" },
      ],
    });
    if (result.value !== "confirm") return;
    setConnections((prev) => prev.filter((c) => c.id !== id));
    toast.success(`已解除與 ${name} 的連結`);
  };

  const hasPending = incomingRequests.length > 0 || outgoingRequests.length > 0;

  return (
    <div className="flex flex-col gap-5">

      {/* ── 待處理請求 ── */}
      {hasPending && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-medium text-[#9FB5B8] px-1">待處理請求</h2>

          {/* 收到的 */}
          {incomingRequests.length > 0 && (
            <div className="flex flex-col gap-2">
              {incomingRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-lg p-3 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={req.photoURL} alt={req.name} />
                      <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                        {req.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CustomLink href={`/users/${req.userId}`} className="text-sm font-medium text-text-dark hover:underline">
                        {req.name}
                      </CustomLink>
                      <p className="text-xs text-[#9FB5B8] truncate">{req.description}</p>
                    </div>
                  </div>

                  {req.connectReason && (
                    <p className="text-xs text-text-dark/70 bg-[#F7FAFA] rounded-lg px-3 py-2 leading-relaxed border border-[#E4EAE9]">
                      「{req.connectReason}」
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(req.id)}
                      className="flex-1 h-8 text-xs cursor-pointer bg-logo-cyan hover:bg-logo-cyan/90 text-white"
                    >
                      接受
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIgnore(req.id, req.name)}
                      className="flex-1 h-8 text-xs cursor-pointer"
                    >
                      忽略
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 發出的 */}
          {outgoingRequests.length > 0 && (
            <div className="flex flex-col gap-2">
              {outgoingRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-lg p-3 flex items-center gap-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={req.photoURL} alt={req.name} />
                    <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                      {req.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CustomLink href={`/users/${req.userId}`} className="text-sm font-medium text-text-dark hover:underline">
                      {req.name}
                    </CustomLink>
                    <p className="text-xs text-[#9FB5B8]">等待對方回應</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWithdraw(req.id)}
                    className="shrink-0 h-8 px-3 text-xs cursor-pointer"
                  >
                    撤回
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 已連結的夥伴 ── */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-[#9FB5B8] px-1">
          已連結的夥伴 {connections.length > 0 && `· ${connections.length} 人`}
        </h2>
        {connections.length === 0 ? (
          <div className="text-center py-12 text-[#9FB5B8] text-sm">
            尚未與任何人建立連結
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {connections.map((conn) => (
              <div key={conn.id} className="bg-white rounded-lg p-3 flex items-center gap-3">
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src={conn.photoURL} alt={conn.name} />
                  <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                    {conn.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CustomLink href={`/users/${conn.userId}`} className="text-sm font-medium text-text-dark hover:underline">
                    {conn.name}
                  </CustomLink>
                  <p className="text-xs text-[#9FB5B8] truncate">{conn.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(conn.id, conn.name)}
                  className="shrink-0 h-8 px-3 text-xs cursor-pointer"
                >
                  解除連結
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
