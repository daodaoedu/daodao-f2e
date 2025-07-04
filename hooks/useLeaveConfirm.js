import { useRouter } from "next/router";
import { useEffect } from "react";

export default function useLeaveConfirm({
  shouldConfirm = false,
  confirmMessage = "資料未儲存，確定要離開此頁面？",
}) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      // eslint-disable-next-line no-alert
      if (!shouldConfirm || window.confirm(confirmMessage)) return;
      router.events.emit("routeChangeError");
      throw new Error(confirmMessage);
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [shouldConfirm, confirmMessage, router.events]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!shouldConfirm) return "";
      event.preventDefault();
      return confirmMessage;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldConfirm, confirmMessage]);

  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      if (event?.reason?.message === confirmMessage) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, [confirmMessage]);

  return null;
}
