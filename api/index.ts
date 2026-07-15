import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {createHydrogenRouterContext} from '../app/lib/context';

interface Env {
  SESSION_SECRET: string;
  PUBLIC_STOREFRONT_API_TOKEN?: string;
  PRIVATE_STOREFRONT_API_TOKEN?: string;
  PUBLIC_STORE_DOMAIN?: string;
  PUBLIC_STOREFRONT_ID?: string;
}

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const env: Env = {
      SESSION_SECRET: process.env.SESSION_SECRET || '',
      PUBLIC_STOREFRONT_API_TOKEN: process.env.PUBLIC_STOREFRONT_API_TOKEN,
      PRIVATE_STOREFRONT_API_TOKEN: process.env.PRIVATE_STOREFRONT_API_TOKEN,
      PUBLIC_STORE_DOMAIN: process.env.PUBLIC_STORE_DOMAIN,
      PUBLIC_STOREFRONT_ID: process.env.PUBLIC_STOREFRONT_ID,
    };

    const hydrogenContext = await createHydrogenRouterContext(
      request,
      env,
      {waitUntil: (promise) => promise} as unknown as ExecutionContext,
    );

    const handleRequest = createRequestHandler({
      build: serverBuild,
      mode: process.env.NODE_ENV,
      getLoadContext: () => hydrogenContext,
    });

    const response = await handleRequest(request);

    if (hydrogenContext.session.isPending) {
      response.headers.set(
        'Set-Cookie',
        await hydrogenContext.session.commit(),
      );
    }

    if (response.status === 404) {
      return storefrontRedirect({
        request,
        response,
        storefront: hydrogenContext.storefront,
      });
    }

    return response;
  } catch (error) {
    console.error(error);
    return new Response('An unexpected error occurred', {status: 500});
  }
}
