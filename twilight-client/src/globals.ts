export const getFromCdn = (key: string) => {
  const baseUrl = import.meta.env.VITE_CDN;
  return `${baseUrl}/object/${key}?bucket=twilight`;
};
