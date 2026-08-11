import { createContext, useContext } from "react";

export const PathnameContext = createContext(window.location.pathname);

export function usePathname() {
  return useContext(PathnameContext);
}

export function navigate(to: string) {
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
