import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'FloAvatar - Glass Pet Companion',
    description: 'Beautiful glassmorphism floating companion that collects tokens as you browse!',
    version: '1.0.0',
    permissions: [
      'storage',
      'activeTab',
      'tabs'
    ],
    host_permissions: [
      '*://*/*'
    ],
    web_accessible_resources: [
      {
        resources: ['assets/*'],
        matches: ['*://*/*']
      }
    ],
    action: {
      default_title: 'FloAvatar Glass Companion',
      default_popup: 'popup.html'
    }
  }
});