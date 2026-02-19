import { NextRequest, NextResponse } from "next/server";

// Rate limit configuration per endpoint
export interface RateLimitConfig {
  requests: number;
  windowMs: number;
}

// Rate limit tiers
export const RATE_LIMITS = {
  // AI generation endpoints - most restrictive
  strict: { requests: 10, windowMs: 60000 }, // 10 requests per minute

  // Write operations (create, update, delete)
  moderate: { requests: 30, windowMs: 60000 }, // 30 requests per minute

  // Read operations
  lenient: { requests: 100, windowMs: 60000 }, // 100 requests per minute
} as const;

// In-memory rate limit store (for production, use Redis or similar)
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  check(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get existing requests for this identifier
    let userRequests = this.requests.get(identifier) || [];

    // Filter out requests outside the current time window
    userRequests = userRequests.filter((timestamp) => timestamp > windowStart);

    // Check if limit exceeded
    if (userRequests.length >= config.requests) {
      return false;
    }

    // Add current request
    userRequests.push(now);
    this.requests.set(identifier, userRequests);

    // Clean up old entries periodically
    if (this.requests.size > 10000) {
      this.cleanup();
    }

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    const oldestWindow = now - 300000; // 5 minutes

    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter((t) => t > oldestWindow);
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }

  getRemaining(identifier: string, config: RateLimitConfig): number {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const userRequests = this.requests.get(identifier) || [];
    const validRequests = userRequests.filter((t) => t > windowStart);
    return Math.max(0, config.requests - validRequests.length);
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Get rate limit identifier from request
 * Uses userId for authenticated requests, IP address for anonymous
 */
function getIdentifier(req: NextRequest): string {
  // Try to get userId from Clerk headers (for authenticated requests)
  const authHeader = req.headers.get("authorization");
  const clerkUserId = req.headers.get("x-clerk-auth-user-id");

  if (clerkUserId) {
    return `user:${clerkUserId}`;
  }

  // Fall back to IP address
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
             req.headers.get("x-real-ip") ||
             "anonymous";
  return `ip:${ip}`;
}

/**
 * Create a rate limit middleware
 * @param config Rate limit configuration
 * @returns NextResponse if rate limited, null if allowed
 */
export function rateLimit(config: RateLimitConfig) {
  return function checkRateLimit(req: NextRequest): NextResponse | null {
    const identifier = getIdentifier(req);
    const allowed = rateLimiter.check(identifier, config);
    const remaining = rateLimiter.getRemaining(identifier, config);

    if (!allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: `Rate limit exceeded. Please try again later.`,
          retryAfter: Math.ceil(config.windowMs / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": config.requests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(Date.now() + config.windowMs).toISOString(),
            "Retry-After": Math.ceil(config.windowMs / 1000).toString(),
          },
        }
      );
    }

    // Return null to indicate the request should proceed
    // The caller should add rate limit headers to the response
    return null;
  };
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  config: RateLimitConfig,
  remaining: number
): NextResponse {
  response.headers.set("X-RateLimit-Limit", config.requests.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", new Date(Date.now() + config.windowMs).toISOString());
  return response;
}

/**
 * Get remaining requests for a user
 */
export function getRemainingRequests(req: NextRequest, config: RateLimitConfig): number {
  const identifier = getIdentifier(req);
  return rateLimiter.getRemaining(identifier, config);
}
