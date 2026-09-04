import { defineConfig } from 'vite';

export default defineConfig({
  // Cartella pubblica per asset che devono essere serviti alla root del dominio.
  publicDir: 'public',

  build: {
    // Output della build nella cartella convenzionale dist.
    outDir: 'dist',

    // Sorgmap abilitati per facilitare il debug in produzione.
    sourcemap: true,
  },

  server: {
    // Porta standard per lo sviluppo locale.
    port: 8080,
  },
});
