import type { APIContext, AstroIntegration } from "astro";
import { pathToRegexp, Key } from "path-to-regexp";
type Method = "GET" | "POST" | "PUT" | "DELETE";
type Route = {
  method: Method;
  uri: string;
  regex: RegExp;
  keys: Key[];
  callbacks: Array<(context?: APIContext) => any>;
};

export function astroPress({
  pattern = "/astropress/[...dynamic]",
  entryPoint = "astropress",
}: {
  pattern: string;
  entryPoint: string;
}): AstroIntegration {
  return {
    name: "astropress",
    hooks: {
      "astro:config:setup": ({ injectRoute }) => {
        injectRoute({
          pattern: pattern,
          entryPoint: entryPoint,
        });
      },
    },
  };
}

export class Router {
  routes: Array<Route> = [];
  middlewares: Set<(context: APIContext) => any> = new Set();
  basePath: string = "/";
  constructor() {
    this.routes = [];
    this.middlewares = new Set();
    return this;
  }

  setBasePath(path: string) {
    this.basePath = path;
  }

  private addRoute(
    method: Method,
    uri: string,
    ...handlers: Array<(context?: any) => any>
  ) {
    if (!uri || !handlers.length)
      throw new Error("uri or callback must be given");
    if (typeof uri !== "string")
      throw new TypeError("typeof uri must be a string");
    if (handlers.every((h) => typeof h !== "function"))
      throw new TypeError("typeof callback must be a function");

    const keys: Key[] = [];
    const fullPath = this.basePath + uri; // Prepend the base path
    const regex = pathToRegexp(fullPath, keys);
    const route = { method, uri: fullPath, regex, keys, callbacks: handlers };
    this.routes.push(route);

    return this;
  }

  route(path: string, router: Router) {
    router.routes.forEach(({ callbacks, method, uri }) => {
      this.addRoute(method, path + uri, ...callbacks);
    });
    return this;
  }

  use(mw: (ctx: APIContext) => any) {
    this.middlewares.add(mw);
  }

  get(uri: string, ...handlers: Array<(context?: any) => any>) {
    this.addRoute("GET", uri, ...handlers);
    return this;
  }
  post(uri: string, ...handlers: Array<(context?: any) => any>) {
    this.addRoute("POST", uri, ...handlers);
    return this;
  }
  put(uri: string, ...handlers: Array<(context?: any) => any>) {
    this.addRoute("PUT", uri, ...handlers);
    return this;
  }
  delete(uri: string, ...handlers: Array<(context?: any) => any>) {
    this.addRoute("DELETE", uri, ...handlers);
    return this;
  }

  private async handler(route: Route, context: APIContext): Promise<Response> {
    for (const middleware of this.middlewares) {
      const response = await middleware.call(this, context);
      if (response instanceof Response) {
        return response;
      }
    }
    for (const callback of route.callbacks) {
      const response = await callback.call(this, context);
      if (response instanceof Response) {
        return response;
      }
    }
    return route.callbacks.at(-1)?.call(this, context);
  }

  async init(context: APIContext): Promise<Response> {
    const path = context.url.pathname;
    const matchingRoute = this.routes.find((route) => {
      if (route.method.toLowerCase() !== context.request.method.toLowerCase()) {
        return false;
      }
      const match = path.match(route.regex);
      if (match) {
        context.params = {};
        for (let i = 0; i < route.keys.length; i++) {
          context.params[route.keys[i].name] = match[i + 1];
        }
        return true;
      }
      return false;
    });
    if (matchingRoute) {
      return await this.handler(matchingRoute, context);
    } else {
      return new Response("Not Found, 404", { status: 404 });
    }
  }
}
