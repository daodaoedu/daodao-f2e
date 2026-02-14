apps/product/src/app/[locale]/auth/onboarding/page.tsx
Comment on lines +19 to +31
  // 初始化完成後記錄狀態
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [isLoading, isAuthenticated, hasInitialized]);

  // 未登入則重定向到首頁（只在初次載入時檢查）
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasInitialized) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, hasInitialized, router]);
@gemini-code-assist
gemini-code-assist bot
4 minutes ago
medium

這兩個 useEffect hook 的依賴項和部分條件相似，可以合併為一個 useEffect 來處理初次載入時的邏輯。這樣可以讓程式碼更簡潔，也避免在 !isLoading && !hasInitialized 的情況下重複執行相似的檢查，進而提升可維護性。

  // 處理初次載入邏輯
  useEffect(() => {
    if (!isLoading && !hasInitialized) {
      if (isAuthenticated) {
        setHasInitialized(true);
      } else {
        router.replace("/");
      }
    }
  }, [isLoading, isAuthenticated, hasInitialized, router]);

apps/product/src/components/onboarding/onboarding-form.tsx
Comment on lines +196 to +214
  const mapApiPathToFormField = (apiPath: string): string | null => {
    const mapping: Record<string, string> = {
      birthDay: "birthDate",
      customId: "customId",
      name: "name",
      personalSlogan: "personalSlogan",
      professionalField: "professionalFields",
      interestList: "interests",
      referralSource: "referralSource",
    };

    for (const [apiField, formField] of Object.entries(mapping)) {
      if (apiPath.includes(apiField)) {
        return formField;
      }
    }

    return null;
  };
@gemini-code-assist
gemini-code-assist bot
4 minutes ago
medium

mapApiPathToFormField 函數中使用 apiPath.includes(apiField) 來映射錯誤欄位，這在 apiField 是另一個欄位名稱的子字串時可能會導致錯誤的映射。例如，如果未來有 customId 和 customId_extra 兩個欄位，includes('customId') 會同時匹配兩者。建議改用更精確的匹配方式，例如完全相等或正則表達式，來增加程式碼的穩健性。

apps/product/src/components/settings/account/personal-info-section.tsx
Comment on lines +55 to +62
  // Debug: 檢查城市選擇器的狀態
  console.log("[City Select Debug]", {
    selectedCountry,
    isLoadingCities,
    citiesDataLength: citiesData?.data?.length,
    filteredCitiesLength: cities.length,
    rawCitiesData: citiesData?.data?.slice(0, 3), // 只顯示前3筆
  });
@gemini-code-assist
gemini-code-assist bot
4 minutes ago
medium

這裡有一段用於偵錯的 console.log。在合併到主分支前，建議將其移除，以保持生產環境程式碼的整潔。
packages/auth/src/lib/auth-provider.tsx
Comment on lines +425 to +477
    // 優先使用 onTemporaryUser 回調
    if (onTemporaryUser) {
      onTemporaryUser(currentUrl);
    } else if (onboardingPath && typeof window !== "undefined") {
      // 否則跳轉到 onboardingPath
      window.location.href = onboardingPath;
    }
  }, [pathname, isAuthenticated, isLoading, isTemporary, onboardingPath, onTemporaryUser]);

  /**

* Email 未驗證處理：如果用戶未驗證 email，跳轉到驗證頁面
* 注意：這個 effect 只在用戶不是臨時用戶時才執行（臨時用戶優先處理 onboarding）
   */
  useEffect(() => {
    // 如果還在載入中，不進行檢查
    if (isLoading) {
      return;
    }

    // 只處理已登入、非臨時用戶、且未驗證 email 的用戶
    if (!isAuthenticated || isTemporary || isEmailVerified) {
      return;
    }

    // 移除 locale 前綴後檢查路徑
    const pathnameWithoutLocale = removeLocalePrefix(pathname);

    // 如果在 email 驗證頁面，不需要跳轉
    const isOnVerificationPage = emailVerificationPath
      ? pathnameWithoutLocale.startsWith(emailVerificationPath)
      : false;
    if (isOnVerificationPage) {
      return;
    }

    // 如果在 onboarding 頁面，不需要跳轉（讓用戶看完 Success 頁面）
    const isOnOnboardingPage = onboardingPath
      ? pathnameWithoutLocale.startsWith(onboardingPath)
      : false;
    if (isOnOnboardingPage) {
      return;
    }

    const currentUrl = pathname + (typeof window !== "undefined" ? window.location.search : "");

    // 優先使用 onEmailUnverified 回調
    if (onEmailUnverified) {
      onEmailUnverified(currentUrl);
    } else if (emailVerificationPath && typeof window !== "undefined") {
      // 否則跳轉到 emailVerificationPath
      window.location.href = emailVerificationPath;
    }
  }, [pathname, isAuthenticated, isLoading, isTemporary, isEmailVerified, onboardingPath, emailVerificationPath, onEmailUnverified]);
@gemini-code-assist
gemini-code-assist bot
4 minutes ago
medium

在處理臨時用戶和未驗證 Email 的重導向時，AuthProvider 的備用邏輯直接使用了 window.location.href，這會導致頁面完整刷新。然而，應用程式的其他部分（例如 onAuthRequired 的回呼）是使用 next/navigation 的 router.push 進行客戶端導航。為了提供更流暢的使用者體驗並保持導航邏輯的一致性，建議統一使用客戶端導航。onTemporaryUser 和 onEmailUnverified 回呼的設計是正確的，應確保在 global-provider.tsx 中總是傳入這些回呼並使用 router.push 執行導航，避免 fallback 到 window.location.href。
