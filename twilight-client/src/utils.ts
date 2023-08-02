export const CDN = (id: string) => {
  return "http://192.168.0.141:5173" + "/api/cdn/" + id;
};


export const fetcher = async(url:string) =>{
  const res = await fetch(url)
  if(!res.ok){
    const message = await res.json()
    throw new Error(JSON.stringify({status:res.status, text:message}))
  }
  return res.json()
}
