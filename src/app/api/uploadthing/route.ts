import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});
