import { AlertTriangle } from "lucide-react";

export default function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-700"
    >
      <AlertTriangle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  );
}