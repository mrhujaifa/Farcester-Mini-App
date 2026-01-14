import { useMiniApp } from "@neynar/react";
import React from "react";
import NotifyUsers from "./NotifyUser";

export default function AdminRoute() {
  const { context } = useMiniApp();

  return <div>{context?.user.fid === 263883 && <NotifyUsers />}</div>;
}
