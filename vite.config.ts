import { defineConfig, type Plugin } from 'vite';
import { cpSync, createReadStream, existsSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const IONICONS_SVG_DIR = resolve(
  import.meta.dirname,
  'node_modules/ionicons/dist/ionicons/svg'
);

/**
 * Serve le icone SVG di ionicons senza dipendere da CDN o plugin esterni.
 *
 * Il web component <ion-icon> carica i file SVG a runtime da `resourcesUrl`:
 * in dev li serve il middleware, in build vengono copiati in dist.
 */
function ioniconsAssets(): Plugin {
  let outDir = 'dist';

  return {
    name: 'ionicons-assets',

    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },

    configureServer(server) {
      server.middlewares.use('/ionicons/svg', (request, response, next) => {
        // basename impedisce path traversal verso file fuori dalla cartella svg.
        const filename = basename(request.url ?? '');
        const filePath = join(IONICONS_SVG_DIR, filename);

        if (!filename.endsWith('.svg') || !existsSync(filePath)) {
          next();
          return;
        }

        response.setHeader('Content-Type', 'image/svg+xml');
        createReadStream(filePath).pipe(response);
      });
    },

    closeBundle() {
      cpSync(IONICONS_SVG_DIR, join(outDir, 'ionicons/svg'), { recursive: true });
    },
  };
}

export default defineConfig({
  // Cartella pubblica per asset che devono essere serviti alla root del dominio.
  publicDir: 'public',

  plugins: [ioniconsAssets()],

  optimizeDeps: {
    // Il loader Stencil di ionicons usa entry lazy-loaded che il dep
    // optimizer non riesce a pre-bundlare ("ion-icon.entry.js does not exist").
    exclude: ['ionicons'],
  },

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
