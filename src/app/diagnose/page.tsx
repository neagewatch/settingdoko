import DiagnoseClient from "./DiagnoseClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "症状から設定を探す", description: "Wi-Fi、通知、バッテリー、画面などの困りごとから設定を探せます。" };

export default function DiagnosePage() { return <DiagnoseClient />; }
