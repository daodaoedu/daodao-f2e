"use client";

import { useConnectionMutations, useConnections, useIncomingConnectionRequests, useOutgoingConnectionRequests } from "@daodao/api";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";

export const ConnectionsSettings = () => {
  const { data: incomingData, isLoading: loadingIncoming } = useIncomingConnectionRequests();
  const { data: outgoingData, isLoading: loadingOutgoing } = useOutgoingConnectionRequests();
  const { data: connectionsData, isLoading: loadingConnections } = useConnections();
  const { accept, ignore, withdraw, disconnect } = useConnectionMutations();
  const { openWarningDialog } = useDialog();

  const isLoading = loadingIncoming || loadingOutgoing || loadingConnections;

  const incomingRequests = incomingData?.data ?? [];
  const outgoingRequests = outgoingData?.data ?? [];
  const connections = connectionsData?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16 text-[#9FB5B8] text-sm">
        載入中...
      </div>
    );
  }

  const handleAccept = async (requestId: string, name: string) => {
    try {
      await accept(requestId);
      toast.success(`已與 ${name} 成為夥伴`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失敗，請稍後再試");
    }
  };

  const handleIgnore = async (requestId: string, name: string) => {
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
    try {
      await ignore(requestId);
      toast.success("已忽略連結請求");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失敗，請稍後再試");
    }
  };

  const handleWithdraw = async (requestId: string, name: string) => {
    const result = await openWarningDialog({
      title: "撤回連結請求？",
      message: `確定要撤回發給 ${name} 的連結請求嗎？`,
      textAlign: "left",
      buttons: [
        { label: "撤回", value: "confirm", variant: "outline" },
        { label: "先不要", value: "cancel", variant: "orange" },
      ],
    });
    if (result.value !== "confirm") return;
    try {
      await withdraw(requestId);
      toast.success("已撤回連結請求");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失敗，請稍後再試");
    }
  };

  const handleDisconnect = async (userId: string, name: string) => {
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
    try {
      await disconnect(userId);
      toast.success(`已解除與 ${name} 的連結`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失敗，請稍後再試");
    }
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
              {incomingRequests.map((req) => {
                const name = req.requesterNickname || "用戶";
                return (
                  <div key={req.requestId} className="bg-white rounded-lg p-3 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <CustomLink href={`/users/${req.requesterExternalId}`} className="shrink-0">
                        <Avatar className="size-10">
                          <AvatarImage src={req.requesterPhotoUrl ?? undefined} alt={name} />
                          <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                            {name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                      </CustomLink>
                      <div className="flex-1 min-w-0">
                        <CustomLink href={`/users/${req.requesterExternalId}`} className="text-sm font-medium text-text-dark hover:underline">
                          {name}
                        </CustomLink>
                      </div>
                    </div>

                    {req.intent && (
                      <p className="text-xs text-text-dark/70 bg-[#F7FAFA] rounded-lg px-3 py-2 leading-relaxed border border-[#E4EAE9]">
                        「{req.intent}」
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(String(req.requestId), name)}
                        className="flex-1 h-8 text-xs cursor-pointer bg-logo-cyan hover:bg-logo-cyan/90 text-white"
                      >
                        接受
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleIgnore(String(req.requestId), name)}
                        className="flex-1 h-8 text-xs cursor-pointer"
                      >
                        忽略
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 發出的 */}
          {outgoingRequests.length > 0 && (
            <div className="flex flex-col gap-2">
              {outgoingRequests.map((req) => {
                const name = req.receiverNickname || "用戶";
                return (
                  <div key={req.requestId} className="bg-white rounded-lg p-3 flex items-center gap-3">
                    <CustomLink href={`/users/${req.receiverExternalId}`} className="shrink-0">
                      <Avatar className="size-10">
                        <AvatarImage src={req.receiverPhotoUrl ?? undefined} alt={name} />
                        <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                          {name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                    </CustomLink>
                    <div className="flex-1 min-w-0">
                      <CustomLink href={`/users/${req.receiverExternalId}`} className="text-sm font-medium text-text-dark hover:underline">
                        {name}
                      </CustomLink>
                      <p className="text-xs text-[#9FB5B8]">等待對方回應</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWithdraw(String(req.requestId), name)}
                      className="shrink-0 h-8 px-3 text-xs cursor-pointer"
                    >
                      撤回
                    </Button>
                  </div>
                );
              })}
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
            {connections.map((conn) => {
              const name = conn.nickname || "用戶";
              return (
                <div key={conn.connectionId} className="bg-white rounded-lg p-3 flex items-center gap-3">
                  <CustomLink href={`/users/${conn.externalId}`} className="shrink-0">
                    <Avatar className="size-10">
                      <AvatarImage src={conn.photoUrl ?? undefined} alt={name} />
                      <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                        {name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  </CustomLink>
                  <div className="flex-1 min-w-0">
                    <CustomLink href={`/users/${conn.externalId}`} className="text-sm font-medium text-text-dark hover:underline">
                      {name}
                    </CustomLink>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(conn.externalId, name)}
                    className="shrink-0 h-8 px-3 text-xs cursor-pointer"
                  >
                    解除連結
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
