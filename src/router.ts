// docs for router https://github.com/thepassle/app-tools/blob/master/router/README.md

import { html } from 'lit';

if (!(globalThis as any).URLPattern) {
  await import("urlpattern-polyfill");
}

import { Router } from '@thepassle/app-tools/router.js';
import { lazy } from '@thepassle/app-tools/router/plugins/lazy.js';

// @ts-ignore
import { title } from '@thepassle/app-tools/router/plugins/title.js';

import './pages/app-home.js';

// The deploy build passes the base without a trailing slash ("/money-tracker").
// Always add it, so that joined paths look like "/money-tracker/expense".
const rawBaseURL: string = (import.meta as any).env.BASE_URL;
const baseURL: string = rawBaseURL.endsWith('/') ? rawBaseURL : rawBaseURL + '/';

// Routes must include the base path (e.g. "/money-tracker/" on GitHub Pages).
// Otherwise the app navigates to "/expense" at the domain root.
// That URL is outside of the app, so a reload there shows the GitHub 404 page.
export const router = new Router({
    // Unknown URLs inside the app fall back to the home page.
    fallback: resolveRouterPath(),
    routes: [
      {
        path: resolveRouterPath(),
        title: 'Home',
        render: () => html`<app-home></app-home>`
      },
      {
        path: resolveRouterPath('expense'),
        title: 'Add Expenses',
        plugins: [
          lazy(() => import('./pages/app-expenses.js')),
        ],
        render: () => html`<app-expenses></app-expenses>`
      },
      {
        path: resolveRouterPath('rates'),
        title: 'Exchange Rates',
        plugins: [
          lazy(() => import('./pages/app-rates.js')),
        ],
        render: () => html`<app-rates></app-rates>`
      },
    ]
  });

  // This function will resolve a path with whatever Base URL was passed to the vite build process.
  // Use of this function throughout the starter is not required, but highly recommended, especially if you plan to use GitHub Pages to deploy.
  // If no arg is passed to this function, it will return the base URL.

  export function resolveRouterPath(unresolvedPath?: string) {
    var resolvedPath = baseURL;
    if(unresolvedPath) {
      resolvedPath = resolvedPath + unresolvedPath;
    }

    return resolvedPath;
  }
