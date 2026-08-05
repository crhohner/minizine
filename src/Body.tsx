import type { ReactNode } from "react";

function Body({ children }: { children: ReactNode }) {
  return <div className="body">{children}</div>;
}

export default Body;
