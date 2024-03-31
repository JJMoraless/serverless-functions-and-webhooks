import type { Context } from '@netlify/functions'

export default async (req: Request, context: Context) => {
  const envExample = process.env.ENV_EXAMPLE;
  console.log({ envExample });

  if(!envExample) {
    throw new Error('ENV_EXAMPLE is not defined');
  }

  const resBody = JSON.stringify({ envExample });

  return new Response(resBody,{
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  })

}
