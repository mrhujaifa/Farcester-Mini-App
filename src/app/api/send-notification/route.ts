import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getUsersNotificationDetails,
  removeInvalidNotificationTokens,
} from "~/lib/kv";

// Define the shape of your user data
interface UserNotificationDetail {
  url: string;
  token: string;
}

const requestSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

// Configuration
const BATCH_SIZE = 100;
const PARALLEL_BATCHES = 5;
const REQUEST_TIMEOUT = 10000;

async function sendNotificationBatch(
  url: string,
  tokens: string[],
  title: string,
  body: string,
  notificationId: string
) {
  const payload = {
    notificationId,
    title,
    body,
    targetUrl: "https://farcester-mini-app-1.vercel.app",
    tokens,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      return {
        successful: json?.result?.successfulTokens?.length || 0,
        invalid: json?.result?.invalidTokens || [],
        rateLimited: json?.result?.rateLimitedTokens?.length || 0,
      };
    } else {
      const errorText = await res.text();
      console.error(`Batch error (${res.status}):`, errorText);
      return { successful: 0, invalid: [], rateLimited: 0 };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(
      "Fetch error:",
      error instanceof Error ? error.message : error
    );
    return { successful: 0, invalid: [], rateLimited: 0 };
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestJson = await request.json();
    const requestBody = requestSchema.safeParse(requestJson);

    if (!requestBody.success) {
      return NextResponse.json(
        { success: false, errors: requestBody.error.errors },
        { status: 400 }
      );
    }

    const allKeys: UserNotificationDetail[] =
      await getUsersNotificationDetails();
    if (!allKeys || allKeys.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users to notify",
      });
    }

    const notificationId = `broadcast-${Date.now()}`;

    // FIX: Group tokens by URL.
    // Sending tokens to the wrong provider URL will cause 404s or delivery failures.
    const urlGroups = allKeys.reduce((acc, curr) => {
      if (!acc[curr.url]) acc[curr.url] = [];
      acc[curr.url].push(curr.token);
      return acc;
    }, {} as Record<string, string[]>);

    // Create batches within those URL groups
    const batches: Array<{ url: string; tokens: string[] }> = [];
    for (const [url, tokens] of Object.entries(urlGroups)) {
      for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
        batches.push({
          url,
          tokens: tokens.slice(i, i + BATCH_SIZE),
        });
      }
    }

    console.log(`Sending ${batches.length} batches to ${allKeys.length} users`);

    let totalSuccessful = 0;
    let totalInvalid = 0;
    let totalRateLimited = 0;
    const allInvalidTokens: string[] = [];

    // Process in chunks of PARALLEL_BATCHES
    for (let i = 0; i < batches.length; i += PARALLEL_BATCHES) {
      const chunk = batches.slice(i, i + PARALLEL_BATCHES);

      const results = await Promise.allSettled(
        chunk.map((batch) =>
          sendNotificationBatch(
            batch.url,
            batch.tokens,
            requestBody.data.title,
            requestBody.data.body,
            notificationId
          )
        )
      );

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          totalSuccessful += result.value.successful;
          totalInvalid += result.value.invalid.length;
          totalRateLimited += result.value.rateLimited;
          allInvalidTokens.push(...result.value.invalid);
        }
      });
    }

    // Cleanup invalid tokens
    if (allInvalidTokens.length > 0) {
      removeInvalidNotificationTokens(allInvalidTokens).catch((err) =>
        console.error("Background cleanup failed:", err)
      );
    }

    const summary = {
      successful: totalSuccessful,
      invalid: totalInvalid,
      rateLimited: totalRateLimited,
      totalBatches: batches.length,
      totalUsers: allKeys.length,
    };

    return NextResponse.json({ success: true, results: summary });
  } catch (error) {
    console.error("Broadcast route crashed:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
