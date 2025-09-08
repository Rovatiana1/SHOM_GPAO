// FIX: Commented out the line below to resolve "Cannot find type definition file for 'vite/client'".
// This is likely due to a misconfiguration in tsconfig.json or a missing dependency.
// The interfaces below provide the necessary types for `import.meta.env` to be used safely.
// /// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_PREFIXE_URL: string;
  readonly VITE_API_KEY: string;
  readonly VITE_BASENAME?: string;
  readonly VITE_NODE_ENV?: "development" | "production" | "test";
  // ajoute d'autres variables VITE_... ici si nécessaire
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
