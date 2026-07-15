import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {createHydrogenRouterContext} from '~/lib/context';

interface Env {
  SESSION_SECRET: string;
  PUBLIC_STOREFRONT_API_TOKEN?: string;
  PRIVATE_STOREFRONT_API_TOKEN?: string;
  PUBLIC_STORE_DOMAIN?: string;
  PUBLIC_STOREFRONT_ID?: string;
}

export async function fetch(
  request: Request,
  env: Env,
  executionContext?: ExecutionContext,
): Promise<Response> {
  try {
    const hydrogenContext = await createHydrogenRouterContext(
      request,
      env,
      executionContext,
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

export default async function handler(request: Request, env: Env) {
  return fetch(request, env);
}
