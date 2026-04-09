// @vitest-environment node
import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const mockSet = vi.fn();
const mockGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ set: mockSet, get: mockGet })),
}));

import { createSession, getSession } from "@/lib/auth";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

describe("createSession", () => {
  beforeEach(() => {
    mockSet.mockClear();
    mockGet.mockClear();
  });

  test("sets an httpOnly cookie", async () => {
    await createSession("user-1", "user@example.com");

    expect(mockSet).toHaveBeenCalledOnce();
    const [name, , options] = mockSet.mock.calls[0];
    expect(name).toBe("auth-token");
    expect(options.httpOnly).toBe(true);
    expect(options.path).toBe("/");
    expect(options.sameSite).toBe("lax");
  });

  test("cookie expires in ~7 days", async () => {
    const before = Date.now();
    await createSession("user-1", "user@example.com");
    const after = Date.now();

    const expiresAt: Date = mockSet.mock.calls[0][2].expires;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
    expect(expiresAt.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
  });

  test("cookie value is a valid JWT containing userId and email", async () => {
    await createSession("user-42", "test@test.com");

    const token: string = mockSet.mock.calls[0][1];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    expect(payload.userId).toBe("user-42");
    expect(payload.email).toBe("test@test.com");
  });

  test("JWT expires in 7 days", async () => {
    const before = Math.floor(Date.now() / 1000);
    await createSession("user-1", "user@example.com");
    const after = Math.floor(Date.now() / 1000);

    const token: string = mockSet.mock.calls[0][1];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const sevenDaysSec = 7 * 24 * 60 * 60;
    expect(payload.exp).toBeGreaterThanOrEqual(before + sevenDaysSec - 5);
    expect(payload.exp).toBeLessThanOrEqual(after + sevenDaysSec + 5);
  });
});

async function makeToken(
  payload: Record<string, unknown>,
  expiresIn = "7d"
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

describe("getSession", () => {
  beforeEach(() => {
    mockGet.mockClear();
  });

  test("returns null when no cookie is present", async () => {
    mockGet.mockReturnValue(undefined);
    expect(await getSession()).toBeNull();
  });

  test("returns the session payload for a valid token", async () => {
    const token = await makeToken({ userId: "user-7", email: "a@b.com" });
    mockGet.mockReturnValue({ value: token });

    const session = await getSession();

    expect(session?.userId).toBe("user-7");
    expect(session?.email).toBe("a@b.com");
  });

  test("returns null for a malformed token", async () => {
    mockGet.mockReturnValue({ value: "not.a.jwt" });
    expect(await getSession()).toBeNull();
  });

  test("returns null for an expired token", async () => {
    const token = await makeToken({ userId: "user-1", email: "x@y.com" }, "0s");
    mockGet.mockReturnValue({ value: token });
    expect(await getSession()).toBeNull();
  });

  test("returns null for a token signed with a different secret", async () => {
    const wrongSecret = new TextEncoder().encode("wrong-secret");
    const token = await new SignJWT({ userId: "user-1", email: "x@y.com" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .setIssuedAt()
      .sign(wrongSecret);

    mockGet.mockReturnValue({ value: token });
    expect(await getSession()).toBeNull();
  });
});
