import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

const additionalContext = {
} as const;

type AdditionalContextType = typeof additionalContext;

declare global {
  interface HydrogenAdditionalContext extends AdditionalContextType {}
  interface HydrogenCustomCartFragment extends CartApiQueryFragment {}
}

async function getCache() {
  if (typeof caches !== 'undefined') {
    try {
      return await caches.open('hydrogen');
    } catch {
      return null;
    }
  }
  return null;
}

export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext?: ExecutionContext,
) {
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext?.waitUntil.bind(executionContext) || ((promise: Promise<unknown>) => promise);
  const [cache, session] = await Promise.all([
    getCache(),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext(
    {
      env,
      request,
      cache,
      waitUntil,
      session,
      i18n: {language: 'EN', country: 'US'},
      cart: {
        queryFragment: CART_QUERY_FRAGMENT,
      },
    },
    additionalContext,
  );

  return hydrogenContext;
}
