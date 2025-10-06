export const getFromCdn = (key: string) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  return `${baseUrl}/i/${key}`;
};
