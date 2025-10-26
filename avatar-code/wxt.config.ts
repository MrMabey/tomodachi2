import { defineConfig } from 'wxt';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  manifest: {
    name: 'Flow Buddy',
    description: 'Your productivity companion with a floating avatar',
    version: '1.0.0',
    permissions: ['storage', 'activeTab', 'system.display'],
    commands: {
      'toggle-pip-panel': {
        suggested_key: {
          default: 'Alt+Shift+U',
          mac: 'Alt+Shift+U'
        },
        description: 'Toggle Picture-in-Picture control panel'
      }
    }
  },
  vite: () => ({
    plugins: [vue()],
    server: {
      https: true
    }
  }),
});
