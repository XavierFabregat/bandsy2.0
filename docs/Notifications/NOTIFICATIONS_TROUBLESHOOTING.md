# Notifications & SSE Troubleshooting Guide

## Overview

This guide covers common issues encountered with the notifications system and Server-Sent Events implementation, along with their solutions. Issues are organized by category for easy reference.

## Quick Diagnostic Checklist

Before diving into specific issues, run through this checklist:

- [ ] Are you authenticated with Clerk?
- [ ] Is the database running and accessible?
- [ ] Are notifications enabled in your browser?
- [ ] Is the SSE connection established?
- [ ] Are there any console errors?
- [ ] Are there any server errors in logs?

## Common Issues & Solutions

### 1. SSE Connection Issues

#### 1.1 Connection Drops with 200 OK Status

**Symptoms:**

- SSE connection closes immediately
- Network tab shows 200 OK instead of pending
- "Connection closed" errors in console

**Cause:**
Stream ends prematurely due to improper `ReadableStream` implementation.

**Solution:**

```typescript
// ❌ Incorrect - stream ends immediately
const stream = new ReadableStream({
  start(controller) {
    controller.close(); // Don't close immediately!
  },
});

// ✅ Correct - keep stream open
const stream = new ReadableStream({
  start(controller) {
    // Store controller, don't close it
    connections.set(userId, { controller, userId });

    // Setup cleanup on disconnect
    request.signal.addEventListener("abort", () => {
      connections.delete(userId);
    });
  },
});
```

#### 1.2 Connections Lost on Next.js Dev Reloads

**Symptoms:**

- Connections work initially
- Stop working after code changes in development
- Need browser refresh to reconnect

**Cause:**
Next.js dev mode module reloading clears connection storage.

**Solution:**
Use `globalThis` to persist connections across reloads:

```typescript
// ❌ Incorrect - lost on reload
const connections = new Map<string, SSEConnection>();

// ✅ Correct - persists across reloads
const globalForSSE = globalThis as unknown as {
  sseConnections: Map<string, SSEConnection> | undefined;
};

const connections = globalForSSE.sseConnections ?? new Map();
globalForSSE.sseConnections = connections;
```

#### 1.3 "Cannot read properties of undefined (reading 'catch')" Error

**Symptoms:**

- Error when sending notifications via SSE
- Writer.write() method fails

**Cause:**
Mismatch between expected writer interface and actual implementation.

**Solution:**

```typescript
// ❌ Incorrect - async writer interface
const writer = {
  write: async (data: Uint8Array) => {
    return controller.enqueue(data);
  },
};

// ✅ Correct - synchronous interface
const writer = {
  write: (data: Uint8Array) => {
    try {
      controller.enqueue(data);
    } catch (error) {
      console.error("Failed to write to SSE stream:", error);
      connections.delete(userId);
    }
  },
};
```

### 2. Database Issues

#### 2.1 SQL Error: "operator does not exist: timestamp with time zone > timestamp with time zone"

**Symptoms:**

- Database query fails when checking `expires_at`
- Error mentions timestamp comparison

**Cause:**
Comparing nullable timestamp column with Date object using Drizzle's `gt()` function.

**Solution:**

```typescript
// ❌ Incorrect - fails on nullable column
const notifications = await db
  .select()
  .from(notificationsTable)
  .where(gt(notificationsTable.expiresAt, new Date()));

// ✅ Correct - handle nullable comparison
const notifications = await db
  .select()
  .from(notificationsTable)
  .where(
    or(
      isNull(notificationsTable.expiresAt),
      sql`${notificationsTable.expiresAt} > ${new Date()}`,
    ),
  );
```

#### 2.2 Notification Type Enum Errors

**Symptoms:**

- Type errors when creating notifications
- "Value not in enum" database errors

**Cause:**
Notification type not added to database enum or TypeScript definitions.

**Solution:**

1. Update database enum:

```typescript
export const notificationTypeEnum = pgEnum("notification_type", [
  "like_received",
  "super_like_received",
  "match_created",
  "message_received",
  "profile_viewed",
  "group_invitation",
  "event_reminder",
  "system_update",
  // Add new types here
]);
```

2. Update TypeScript types:

```typescript
export interface NotificationData {
  like_received?: {
    fromUserId: string;
    fromUserName: string;
    fromUserImage?: string;
  };
  // Add corresponding data types
}
```

3. Generate and run migration:

```bash
npm run db:generate
npm run db:push
```

### 3. Authentication Issues

#### 3.1 "Unauthorized" Error on SSE Connection

**Symptoms:**

- SSE connection returns 401 Unauthorized
- User is logged in but connection fails

**Cause:**

- Session cookie not included in SSE request
- Authentication middleware not working with EventSource

**Solution:**

1. Verify cookies are included:

```typescript
// EventSource automatically includes cookies, but verify:
const eventSource = new EventSource("/api/notifications/stream", {
  withCredentials: true, // Not needed for same-origin, but explicit
});
```

2. Check authentication in SSE route:

```typescript
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.error("No userId in auth");
      return new Response("Unauthorized", { status: 401 });
    }
    // ... rest of implementation
  } catch (error) {
    console.error("Auth failed:", error);
    return new Response("Authentication failed", { status: 401 });
  }
}
```

### 4. Browser Notification Issues

#### 4.1 Notifications Not Showing in Safari

**Symptoms:**

- SSE messages received correctly
- No browser notifications appear
- Safari on macOS

**Cause:**
Safari requires explicit user permission request with user gesture.

**Solution:**

```typescript
// ✅ Add permission request button
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return Notification.permission === 'granted';
};

// Trigger on user interaction (button click)
<button onClick={requestNotificationPermission}>
  Enable Notifications
</button>
```

#### 4.2 Notifications Not Showing in Chrome on macOS

**Symptoms:**

- Notifications work in Safari
- Permission granted in Chrome
- No notifications appear in Chrome

**Cause:**
Chrome on macOS requires specific notification settings and options.

**Solution:**

1. Check macOS System Preferences:
   - System Preferences → Notifications → Chrome
   - Set to "Alerts" not "Banners"
   - Enable "Allow Notifications"

2. Use Chrome-compatible notification options:

```typescript
const showBrowserNotification = (notification: Notification) => {
  if (Notification.permission === "granted") {
    const browserNotif = new Notification(notification.title, {
      body: notification.message,
      icon: "/favicon.ico",
      requireInteraction: true, // Prevents auto-dismiss on macOS
      renotify: true, // Important for Chrome
      tag: notification.id, // Prevent duplicates
    });

    // Auto-close after 5 seconds
    setTimeout(() => browserNotif.close(), 5000);
  }
};
```

### 5. API Route Issues

#### 5.1 "Method Not Allowed" (405) Error

**Symptoms:**

- API route returns 405 error
- Some HTTP methods work, others don't

**Cause:**
Missing HTTP method handler in API route.

**Solution:**

```typescript
// ❌ Incorrect - only exports GET
export async function GET() {
  /* ... */
}

// ✅ Correct - export all needed methods
export async function GET() {
  /* ... */
}
export async function POST() {
  /* ... */
}
export async function PATCH() {
  /* ... */
}
export async function DELETE() {
  /* ... */
}
```

#### 5.2 CORS Issues with SSE

**Symptoms:**

- SSE connection fails with CORS error
- Cross-origin request blocked

**Cause:**
Missing CORS headers for SSE endpoint.

**Solution:**

```typescript
export async function GET(request: NextRequest) {
  // ... authentication and setup

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*", // Or specific domain
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
```

### 6. Performance Issues

#### 6.1 High Memory Usage

**Symptoms:**

- Memory usage increases over time
- Application becomes slow
- Server crashes with out-of-memory errors

**Cause:**

- Connection leaks
- Notifications not being cleaned up
- Missing garbage collection

**Solution:**

1. Implement connection cleanup:

```typescript
// Cleanup old connections periodically
setInterval(
  () => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [userId, connection] of connections.entries()) {
      if (now - connection.connectedAt.getTime() > maxAge) {
        connections.delete(userId);
      }
    }
  },
  5 * 60 * 1000,
); // Every 5 minutes
```

2. Cleanup expired notifications:

```typescript
// Database cleanup job
export async function cleanupNotifications() {
  await db
    .delete(notificationsTable)
    .where(
      and(
        isNotNull(notificationsTable.expiresAt),
        lt(notificationsTable.expiresAt, new Date()),
      ),
    );
}
```

#### 6.2 Slow Notification Queries

**Symptoms:**

- Long delays loading notifications
- Database timeouts
- High CPU usage

**Cause:**
Missing database indexes or inefficient queries.

**Solution:**

1. Add database indexes:

```sql
-- Essential indexes for notifications
CREATE INDEX notifications_user_id_idx ON bandsy_notification(user_id);
CREATE INDEX notifications_user_unread_idx ON bandsy_notification(user_id, is_read);
CREATE INDEX notifications_created_at_idx ON bandsy_notification(created_at DESC);
CREATE INDEX notifications_expires_at_idx ON bandsy_notification(expires_at);
```

2. Optimize queries:

```typescript
// ✅ Efficient query with proper indexes
const notifications = await db
  .select()
  .from(notificationsTable)
  .where(
    and(
      eq(notificationsTable.userId, userId),
      eq(notificationsTable.isRead, false),
    ),
  )
  .orderBy(desc(notificationsTable.createdAt))
  .limit(20)
  .offset(offset);
```

### 7. Frontend Issues

#### 7.1 React State Not Updating

**Symptoms:**

- SSE messages received in console
- UI doesn't update with new notifications
- Stale notification count

**Cause:**
State updates in wrong component or missing re-renders.

**Solution:**

```typescript
// ✅ Ensure proper state updates
const useNotificationSSE = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      // Prevent duplicates
      const exists = prev.some((n) => n.id === notification.id);
      if (exists) return prev;

      return [notification, ...prev];
    });
  }, []);
};
```

#### 7.2 Hook Dependencies Warning

**Symptoms:**

- React warnings about missing dependencies
- Infinite re-renders
- Performance issues

**Cause:**
Missing or incorrect dependencies in `useEffect` or `useCallback`.

**Solution:**

```typescript
// ✅ Proper dependency management
const useNotificationSSE = () => {
  const connect = useCallback(() => {
    const eventSource = new EventSource("/api/notifications/stream");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleMessage(data);
    };

    return eventSource;
  }, []); // Empty deps - function doesn't change

  const handleMessage = useCallback((data: any) => {
    // Handle message logic
  }, []); // Include dependencies if any
};
```

## Debugging Tools

### 1. Console Commands

```javascript
// Check active SSE connections (in browser console)
console.log("EventSource state:", eventSource.readyState);
// 0 = CONNECTING, 1 = OPEN, 2 = CLOSED

// Check notification permissions
console.log("Notification permission:", Notification.permission);

// Test notification
new Notification("Test", { body: "This is a test notification" });
```

### 2. Server-Side Debugging

```typescript
// Add to SSE service for debugging
export class NotificationSSEService {
  static debug() {
    console.log("=== SSE Debug Info ===");
    console.log("Active connections:", connections.size);
    console.log("Connection details:", Array.from(connections.entries()));
    console.log("Memory usage:", process.memoryUsage());
  }
}

// Call in API route or server action
NotificationSSEService.debug();
```

### 3. Network Tab Analysis

**What to look for:**

- SSE connection status (should be "pending")
- Response headers include `text/event-stream`
- Messages appear in EventStream tab
- No CORS errors

### 4. Database Debugging

```sql
-- Check notification statistics
SELECT
  type,
  COUNT(*) as count,
  COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count
FROM bandsy_notification
GROUP BY type;

-- Check expired notifications
SELECT COUNT(*) as expired_count
FROM bandsy_notification
WHERE expires_at IS NOT NULL
AND expires_at < NOW();

-- Check recent notifications
SELECT id, title, message, type, created_at
FROM bandsy_notification
ORDER BY created_at DESC
LIMIT 10;
```

## Environment-Specific Issues

### Development Environment

**Common Issues:**

- Hot reloading breaks SSE connections
- Database not running
- Environment variables not loaded

**Solutions:**

```bash
# Start database
npm run db:start

# Check environment variables
echo $DATABASE_URL

# Restart dev server if connections break
npm run dev
```

### Production Environment

**Common Issues:**

- Reverse proxy buffering SSE
- SSL certificate issues
- Memory limits

**Solutions:**

```nginx
# Nginx configuration for SSE
location /api/notifications/stream {
    proxy_pass http://app;
    proxy_buffering off;
    proxy_cache off;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
}
```

## Getting Help

### Information to Include

When reporting issues, include:

1. **Environment:** Development/Production, OS, Browser
2. **Error Messages:** Complete error text and stack traces
3. **Steps to Reproduce:** Detailed sequence of actions
4. **Expected vs Actual:** What should happen vs what happens
5. **Console Logs:** Both browser and server logs
6. **Network Activity:** Screenshots of Network tab
7. **Database State:** Relevant query results

### Useful Log Commands

```bash
# View server logs
npm run dev 2>&1 | grep -E "(SSE|notification|error)"

# Database logs (if using Docker)
docker logs bandsy-db 2>&1 | tail -50

# Check database connection
npm run db:studio
```

This troubleshooting guide should help resolve most issues encountered with the notifications and SSE system. Keep this document updated as new issues are discovered and resolved.
