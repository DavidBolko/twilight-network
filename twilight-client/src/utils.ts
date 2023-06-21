export const CDN = (id: string) => {
  return "http://localhost:5173" + "/api/cdn/" + id;
};

/* export async function fetcher<JSON = any>(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<JSON> {
    const res = await fetch(input, init)
    return res.json()
  } */

export const fetcher = async (
  input: RequestInfo,
  init: RequestInit,
  ...args: any[]
) => {
  const res = await fetch(input, init)
  if (!res.ok) {
    throw new Error(JSON.stringify({status:404, text:"Not Found!"}))
  }
  return res.json()
};
