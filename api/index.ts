export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const {fetch: handleRequest} = await import('../dist/server/index.js');
    
    const env = {
      SESSION_SECRET: process.env.SESSION_SECRET || '',
      PUBLIC_STOREFRONT_API_TOKEN: process.env.PUBLIC_STOREFRONT_API_TOKEN,
      PRIVATE_STOREFRONT_API_TOKEN: process.env.PRIVATE_STOREFRONT_API_TOKEN,
      PUBLIC_STORE_DOMAIN: process.env.PUBLIC_STORE_DOMAIN,
      PUBLIC_STOREFRONT_ID: process.env.PUBLIC_STOREFRONT_ID,
    };

    return handleRequest(request, env);
  } catch (error) {
    console.error('API handler error:', error);
    return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown'}`, {status: 500});
  }
}
