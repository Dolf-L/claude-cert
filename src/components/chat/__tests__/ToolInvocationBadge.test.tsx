import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// str_replace_editor labels

test("create command shows 'Creating <filename>'", () => {
  const inv: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={inv} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("create command extracts filename from deep path", () => {
  const inv: ToolInvocation = {
    toolCallId: "2",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/src/components/Button.tsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={inv} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("str_replace command shows 'Editing <filename>'", () => {
  const inv: ToolInvocation = {
    toolCallId: "3",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "/Counter.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={inv} />);
  expect(screen.getByText("Editing Counter.jsx")).toBeDefined();
});

test("insert command shows 'Editing <filename>'", () => {
  const inv: ToolInvocation = {
    toolCallId: "4",
    toolName: "str_replace_editor",
    args: { command: "insert", path: "/Counter.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={inv} />);
  expect(screen.getByText("Editing Counter.jsx")).toBeDefined();
});

test("undo_edit command shows 'Undoing edit in <filename>'", () => {
  const inv: ToolInvocation = {
    toolCallId: "5",
    toolName: "str_replace_editor",
    args: { command: "undo_edit", path: "/App.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={inv} />);
  expect(screen.getByText("Undoing edit in App.jsx")).toBeDefined();
});

test("view command shows 'Viewing <filename>'", () => {
  const inv: ToolInvocation = {
    toolCallId: "6",
    toolName: "str_replace_editor",
    args: { command: "view", path: "/App.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={inv} />);
  expect(screen.getByText("Viewing App.jsx")).toBeDefined();
});

test("unknown str_replace_editor command falls back to tool name", () => {
  const inv: ToolInvocation = {
    toolCallId: "7",
    toolName: "str_replace_editor",
    args: { command: "unknown_cmd", path: "/App.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={inv} />);
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

// file_manager labels

test("delete command shows 'Deleting <filename>'", () => {
  const inv: ToolInvocation = {
    toolCallId: "8",
    toolName: "file_manager",
    args: { command: "delete", path: "/OldFile.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={inv} />);
  expect(screen.getByText("Deleting OldFile.jsx")).toBeDefined();
});

test("rename command shows 'Renaming <filename>'", () => {
  const inv: ToolInvocation = {
    toolCallId: "9",
    toolName: "file_manager",
    args: { command: "rename", path: "/OldFile.jsx", new_path: "/NewFile.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={inv} />);
  expect(screen.getByText("Renaming OldFile.jsx")).toBeDefined();
});

test("unknown file_manager command falls back to tool name", () => {
  const inv: ToolInvocation = {
    toolCallId: "10",
    toolName: "file_manager",
    args: { command: "unknown_cmd", path: "/OldFile.jsx" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={inv} />);
  expect(screen.getByText("file_manager")).toBeDefined();
});

// Unknown tool fallback

test("unknown tool name renders raw tool name", () => {
  const inv: ToolInvocation = {
    toolCallId: "11",
    toolName: "web_search",
    args: { query: "react" },
    state: "result",
    result: "ok",
  };
  render(<ToolInvocationBadge toolInvocation={inv} />);
  expect(screen.getByText("web_search")).toBeDefined();
});

// State rendering

test("in-progress state shows spinner and no green dot", () => {
  const inv: ToolInvocation = {
    toolCallId: "12",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "call",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={inv} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("completed state shows green dot and no spinner", () => {
  const inv: ToolInvocation = {
    toolCallId: "13",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "result",
    result: "ok",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={inv} />);
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("result state with null result shows spinner", () => {
  const inv: ToolInvocation = {
    toolCallId: "14",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "result",
    result: null,
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={inv} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});
