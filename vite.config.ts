import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'serve-root-audio-files',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url ? req.url.split('?')[0] : '';
            const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm'];
            const isAudioRequest = audioExtensions.some(ext => url.endsWith(ext));

            if (isAudioRequest) {
              const filename = path.basename(url);
              // Possible locations
              const searchPaths = [
                path.resolve(process.cwd(), 'public/assets', filename),
                path.resolve(process.cwd(), 'public', filename),
                path.resolve(process.cwd(), filename),
                path.resolve(process.cwd(), 'assets', filename),
              ];

              for (const filePath of searchPaths) {
                if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                  const ext = path.extname(filePath).toLowerCase();
                  const mimeTypes: Record<string, string> = {
                    '.mp3': 'audio/mpeg',
                    '.wav': 'audio/wav',
                    '.m4a': 'audio/mp4',
                    '.aac': 'audio/aac',
                    '.ogg': 'audio/ogg',
                    '.webm': 'audio/webm',
                  };
                  res.setHeader('Content-Type', mimeTypes[ext] || 'audio/mpeg');
                  res.setHeader('Cache-Control', 'no-cache');
                  fs.createReadStream(filePath).pipe(res);
                  return;
                }
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
