import { cn } from "@daodao/ui/lib/utils";
import { CONNECTED_SERVICES } from "../constants";

export function ConnectedServicesGrid() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {CONNECTED_SERVICES.map((service) => (
        <div
          key={service.id}
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl border p-3",
            service.connected
              ? "border-[#16B9B3] bg-[rgba(22,185,179,0.05)]"
              : "border-[#E0E4E8] bg-[#F5F7FA] opacity-50"
          )}
        >
          <span className="text-xl">{service.emoji}</span>
          <span className="text-[10px] text-[#636E72]">{service.name}</span>
          {service.connected && <span className="text-[10px] text-[#16B9B3]">已連結</span>}
        </div>
      ))}
    </div>
  );
}
