import { type NextPage } from "next";
import type React from "react";

// eslint-disable-next-line @typescript-eslint/ban-types
export type Page<P = {}, IP = P> = NextPage<P, IP> & {
    layout?: React.FC<{ children: React.ReactNode }>;
}
