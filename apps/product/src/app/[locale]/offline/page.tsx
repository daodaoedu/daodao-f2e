export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">目前沒有網路連線</h1>
        <p className="mt-2 text-muted-foreground">請檢查網路連線後重試</p>
      </div>
    </div>
  );
}
