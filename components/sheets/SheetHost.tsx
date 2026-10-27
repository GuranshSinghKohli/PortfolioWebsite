"use client";

import dynamic from "next/dynamic";

import { useSheet } from "@/lib/sheets";

const Sheets = dynamic(() => import("./Sheets").then((mod) => mod.Sheets), { ssr: false });

/** Mounts the sheet chunk once something asks for a sheet, and keeps it mounted. */
export function SheetHost() {
  const { request } = useSheet();
  return request ? <Sheets /> : null;
}
