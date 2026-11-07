import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// The dashboard reads the portfolio's own files (../assets, ../content-strings.json, ../docs) at build time.
// base is /dashboard/ because the custom domain serves the repo root; the product stays at /.
export default defineConfig({
  base: '/dashboard/',
  plugins: [react()],
  server: { fs: { allow: ['..'] } },
  // jesun.py is fetched by the playground worker as a file, not bundled.
  assetsInclude: ['**/*.py'],
});
