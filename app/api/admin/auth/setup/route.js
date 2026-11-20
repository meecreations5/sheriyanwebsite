// Legacy route disabled: the CMS no longer has a first-time setup screen or setup token.
export const runtime='nodejs';
export async function POST(){return Response.json({error:'The setup form has been removed. Sign in with your cms_users account.'},{status:410,headers:{'Cache-Control':'no-store'}})}
