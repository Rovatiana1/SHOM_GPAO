// config.ts
interface AppConfig {
  basename: string;
  // Ajoute d'autres propriétés si nécessaire
}

// Lire les variables d'environnement via import.meta.env
// Note : assure-toi que ce fichier sera utilisé dans un projet Vite
const config: AppConfig = {
  basename: import.meta.env.VITE_BASENAME || "/",
};

type Environment = "development" | "production" | "test";
const environment: Environment =
  (import.meta.env.VITE_NODE_ENV as Environment) || "development";

export default config;
export { environment };
