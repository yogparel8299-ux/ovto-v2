import type { AIWorker, MockFile } from "@/types";

export const mockUserEmail = "founder@octo.workspace";

export const mockWorkers: AIWorker[] = [
  {
    id: "w-1",
    name: "Clara",
    role: "Support",
    status: "running",
    avatarColor: "bg-stone-100 text-stone-900 border-stone-200",
    connectedApps: ["Gmail", "Shopify"],
    tasksCount: 148,
  },
  {
    id: "w-2",
    name: "Valkyrie",
    role: "Finance",
    status: "running",
    avatarColor: "bg-stone-100 text-stone-900 border-stone-200",
    connectedApps: ["Stripe", "Notion"],
    tasksCount: 84,
  },
  {
    id: "w-3",
    name: "Atlas",
    role: "Operations",
    status: "paused",
    avatarColor: "bg-[#FCFCFB] text-stone-900 border-stone-200",
    connectedApps: ["Gmail", "Slack"],
    tasksCount: 61,
  },
  {
    id: "w-4",
    name: "Synthesizer",
    role: "Marketing",
    status: "completed",
    avatarColor: "bg-stone-50 text-stone-600 border-stone-100",
    connectedApps: ["Notion", "Slack"],
    tasksCount: 104,
  },
];

export const mockFiles: MockFile[] = [
  {
    name: "refund_processing_policy_2026.pdf",
    size: "1.4 MB",
    type: "PDF",
    uploadedAt: "10 mins ago",
  },
  {
    name: "supplier_contacts_shipping.xlsx",
    size: "18.2 MB",
    type: "Spreadsheet",
    uploadedAt: "2 hours ago",
  },
  {
    name: "company_branding_guidelines.docx",
    size: "2.1 MB",
    type: "Document",
    uploadedAt: "Yesterday",
  },
];

export const mockApps = [
  {
    name: "Gmail",
    connected: true,
    desc: "Dispatches custom emails and reads customer threads",
  },
  {
    name: "Slack",
    connected: true,
    desc: "Notifies workspace chat loops of critical business events",
  },
  {
    name: "Shopify",
    connected: true,
    desc: "Queries customer records and active shopping carts",
  },
  {
    name: "Notion",
    connected: true,
    desc: "Keeps workspace wikis, marketing material, and meeting logs",
  },
  {
    name: "Stripe",
    connected: true,
    desc: "Gathers balance settlements and ledger transaction flows",
  },
  {
    name: "Google Drive",
    connected: false,
    desc: "Stores large archival compliance files and spreadsheets",
  },
];

export const mockConnectedApps = mockApps
  .filter((app) => app.connected)
  .map((app) => app.name);

export function mockAddActivity(_text: string, _worker: string) {}
