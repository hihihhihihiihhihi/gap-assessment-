import { NextResponse } from "next/server";

/** Structured tool/route result per docs/SECURITY.md — never throw silently. */
export interface ApiFailure {
  success: false;
  retryable: boolean;
  reason: string;
}

export function fail(
  reason: string,
  { status = 400, retryable = false }: { status?: number; retryable?: boolean } = {},
) {
  return NextResponse.json<ApiFailure>(
    { success: false, retryable, reason },
    { status },
  );
}

export function ok<T extends object>(payload: T, status = 200) {
  return NextResponse.json({ success: true, ...payload }, { status });
}
