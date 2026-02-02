"use client";

import getEnv from "../config/env";

export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

export const emitUnauthorized = () => {
  if (getEnv().isServerSide) return;
  window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
};

export const onUnauthorized = (handler: () => void) => {
  if (getEnv().isServerSide) return () => {};
  const listener = () => handler();
  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, listener);
  return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, listener);
};
