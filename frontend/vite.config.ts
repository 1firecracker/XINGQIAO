import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // #region agent log
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const logEntry = JSON.stringify({location:'vite.config.ts:6',message:'Vite config loaded',data:{mode,port:3000,hasProxy:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch(e) {}
    // #endregion
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
          },
          '/files': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
          },
        },
      },
      plugins: [react()],
      // Vite会自动处理import.meta.env，不需要在这里定义
      // 但我们可以设置默认值
      envPrefix: ['VITE_', 'REACT_APP_'],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        outDir: 'build',
      }
    };
});

