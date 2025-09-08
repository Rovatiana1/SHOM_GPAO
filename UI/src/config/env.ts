interface Env {
  BASE_URL: string;
  PREFIXE_URL: string;
  API_KEY: string;
}

const env: Env = {
  BASE_URL: import.meta.env.VITE_API_URL as string,
  PREFIXE_URL: import.meta.env.VITE_PREFIXE_URL as string,
  API_KEY: import.meta.env.VITE_API_KEY as string,
};

export default env;
