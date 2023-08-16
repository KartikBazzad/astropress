# Astropress

a plugin for Astro to create api endpoints

NOTE: Under Development, Find any bugs open a ticket or fork and create a PR.

## Plugin Config

```.ts

import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";
import { astroPress } from "astropress";

// https://astro.build/config
export default defineConfig({
  integrations: [
    astroPress({
      pattern: "/routes/[...dynamic]",
      entryPoint: "./src/api/index.ts",
    }),
  ],
  output: "server",
  adapter: vercel(),
});

```

## Create Endpoint:

```.ts
import { APIContext, APIRoute } from "astro";
import { Router } from "astropress";
const router = new Router();
router.setBasePath("/routes");
router.get("/hello", () => {
  return new Response("Pong");
});

router.get("/user/:id", (ctx) => {
  console.log(ctx.params);
  return new Response("User");
});

export const all: APIRoute = (ctx: APIContext) => router.init(ctx as any);
```

### RoadMap

Next Release:

1. Attach Middlewares properly.
2. Adding Child Routes.
3. Customize the Context Object.
4. Find a solution to make the response more fast.

### Feature Request

Create a Ticket for new features.

Feel Free to contribute Fork , edit and Share,
