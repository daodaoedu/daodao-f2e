import { Redirect } from 'expo-router'

export default function Index() {
  // TODO: 檢查登入狀態，未登入導向 /login，已登入導向 /(tabs)
  // 目前暫時導向首頁
  return <Redirect href="/(tabs)" />
}
