import type { ReactNode } from "react";
import "./Body.css";

function Body({ children }: { children: ReactNode }) {
  return <div className="body">{children}</div>;
}

export default Body;
