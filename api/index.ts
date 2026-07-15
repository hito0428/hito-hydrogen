export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const env = {
      SESSION_SECRET: process.env.SESSION_SECRET || '',
      PUBLIC_STOREFRONT_API_TOKEN: process.env.PUBLIC_STOREFRONT_API_TOKEN,
      PRIVATE_STOREFRONT_API_TOKEN: process.env.PRIVATE_STOREFRONT_API_TOKEN,
      PUBLIC_STORE_DOMAIN: process.env.PUBLIC_STORE_DOMAIN,
      PUBLIC_STOREFRONT_ID: process.env.PUBLIC_STOREFRONT_ID,
    };

    const serverBuild = await import('../build/server/index.js');
    
    if (typeof serverBuild.fetch === 'function') {
      return serverBuild.fetch(request, env);
    } else if (typeof serverBuild.default === 'function') {
      return serverBuild.default(request, env);
    }
    
    return new Response('Server build does not export a valid handler', {status: 500});
  } catch (error) {
    console.error('Error:', error);
    return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {status: 500});
  }
}
