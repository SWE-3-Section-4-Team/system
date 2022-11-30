import "../styles/reset.css";
import "../styles/globals.scss";

import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

import { trpc } from "../utils/trpc";
import type { Page } from "../types/page";
import React from "react";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {

  const Layout = (Component as Page).layout ?? React.Fragment;

  return (
    <SessionProvider session={session}>
      <Toaster />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
