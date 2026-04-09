"use client";

import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

function getFilename(filePath: string): string {
  return filePath.split("/").filter(Boolean).pop() ?? filePath;
}

function deriveLabel(toolName: string, args: Record<string, unknown>): string {
  if (toolName === "str_replace_editor") {
    const filename = getFilename((args.path as string) ?? "");
    switch (args.command) {
      case "create":      return `Creating ${filename}`;
      case "str_replace":
      case "insert":      return `Editing ${filename}`;
      case "undo_edit":   return `Undoing edit in ${filename}`;
      case "view":        return `Viewing ${filename}`;
      default:            return toolName;
    }
  }
  if (toolName === "file_manager") {
    const filename = getFilename((args.path as string) ?? "");
    switch (args.command) {
      case "delete": return `Deleting ${filename}`;
      case "rename": return `Renaming ${filename}`;
      default:       return toolName;
    }
  }
  return toolName;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const label = deriveLabel(
    toolInvocation.toolName,
    (toolInvocation.args ?? {}) as Record<string, unknown>
  );
  const isDone = toolInvocation.state === "result" && toolInvocation.result != null;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
