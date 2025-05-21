/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_APP_API_URL?: string;
    readonly PROD: boolean;
    [key: string]: any;
  };
}