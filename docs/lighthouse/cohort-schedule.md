# 場次聚會時段規則

依據 [時區顯示 FRD v0.2](https://docs.google.com/document/d/1Mdy1kgdNRNvSWlLc6tgriAjLTGvs20gRf_nFsY9WMjc/edit)（2026-10-28）及 [daodao#347](https://github.com/daodaoedu/daodao/issues/347)。

FRD v0.2 的 FR-003／TP-005 取代舊 FR-BS-03／TP-BS-07 關於新增入口及空白列的規定：使用「新增聚會時段」選單，提供規律／非規律時段；沒有聚會時可以沒有列，刪除最後一列不補空白列。新增非規律列的日期預設空白、時間沿用前一筆；日期未填必須阻止提交並標示，不再靜默略過。歷史 OpenSpec 封存文件保留當時版本，不作現行規則。

每場次共用一個 IANA 時區，預設 Asia/Taipei。只含非同步互動時隱藏聚會設定；切換後保存會清空已存聚會時段。改時區保留聚會的日期及鐘面時間；參與者頁依瀏覽器時區換算，無法取得時回退場次時區。只有日期而沒有鐘面時間的聚會不代表可換算的時間點，保留日期並標示場次時區。DST 重複或不存在時刻採 TZDate 的 Date-compatible 解讀。

規律資料保存群組 ID、規則及每場獨立日期時間，不從手動日期猜測分組。場次上限 50 筆；規律新增超過剩餘容量時整批拒絕。折疊狀態日期編輯等量平移；清空代表日期不抹掉整組日期間距。逐場展開後僅修改或刪除該筆。

發布順序為 storage migration → server API → frontend；僅合併前端不足以使用本功能。是否已部署及 PM 驗收以中央 issue 最新交接證據為準。
