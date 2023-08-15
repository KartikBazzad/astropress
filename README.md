# Astropress

a plugin for Astro to create endpoints

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

NOTE: Under Development
