import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file from current directory
    const env = loadEnv(mode, '.', '');
    
    return {
      // Set the base path to match your new repository name
      base: '/SolarYieldPro/', 
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // This allows the app to use the API key from GitHub Secrets or a local .env file
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // Sets up the '@' alias to point to your project root
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
