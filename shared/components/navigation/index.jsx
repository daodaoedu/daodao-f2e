import React, { useCallback, useMemo, useLayoutEffect } from "react";
import styled from "@emotion/styled";
// import Link from 'next/link';
import { useDispatch, useSelector } from "react-redux";
import Script from "next/script";
import MainNav from "./MainNav";
import SubNav from "./SubNav";
import { NAV_LINK, CATEGORY_LINK } from "../../../constants/category";

const NavigationWrapper = styled.nav`
  white-space: nowrap;
`;

const Navigation = () => {
  const dispatch = useDispatch();
  // const userState = useSelector((state) => state.user);
  // const userData = useMemo(() => userState.userData, [userState.userData]);
  // useLayoutEffect(() => {
  //   dispatch(checkLogin());
  // }, [checkLogin, dispatch]);
  // const onLogin = useCallback(
  //   () => dispatch(userLogin()),
  //   [userLogin, dispatch]
  // );
  // const onLogout = useCallback(
  //   () => dispatch(userLogout()),
  //   [userLogout, dispatch]
  // );
  return (
    <NavigationWrapper>
      {/* <Script
        id="firebase-app"
        src="https://www.gstatic.com/firebasejs/7.20.0/firebase-app.js"
      />
      <Script
        id="firebase-auth"
        src="https://www.gstatic.com/firebasejs/7.20.0/firebase-auth.js"
        onLoad={() => {
          const firebaseConfig = {
            apiKey: "AIzaSyAH7aXOe4717RHVD6SEgVQWv_rYjHjB2r4",
            authDomain: "meow-learning-324710.firebaseapp.com",
            projectId: "meow-learning-324710",
            storageBucket: "meow-learning-324710.appspot.com",
            messagingSenderId: "860219610175",
            appId: "1:860219610175:web:f1f1c844665a416143148a",
            measurementId: "G-EVP48286J3",
            databaseURL:
              "https://meow-learning-324710-default-rtdb.asia-southeast1.firebasedatabase.app",
          };
          // Initialize Firebase
          // eslint-disable-next-line no-undef
          const result = firebase.initializeApp(firebaseConfig);
          console.log(result);
        }}
      /> */}
      {/* <Script
        id="google-api"
        src="https://apis.google.com/js/api.js"
        onLoad={() => window.gapi.load('auth2')}
      /> */}
      <MainNav
        linkList={NAV_LINK}
        // onLogin={onLogin}
        // onLogout={onLogout}
        // userData={userData}
      />
      <SubNav list={CATEGORY_LINK} />
    </NavigationWrapper>
  );
};

export default Navigation;
