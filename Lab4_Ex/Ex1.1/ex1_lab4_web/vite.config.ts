import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function optimizeInitialRouteAssets(): Plugin {
  return {
    name: 'optimize-initial-route-assets',
    enforce: 'post',
    apply: 'build',
    generateBundle(_options, bundle) {
      const htmlAsset = bundle['index.html']
      const cssAsset = Object.values(bundle).find(
        (asset) => asset.type === 'asset' && asset.fileName.endsWith('.css'),
      )

      if (!htmlAsset || htmlAsset.type !== 'asset' || !cssAsset || cssAsset.type !== 'asset') {
        return
      }

      htmlAsset.source = String(htmlAsset.source).replace(
        /<link rel="stylesheet"[^>]*href="[^"]+"[^>]*>/,
        `<style>${String(cssAsset.source)}</style>`,
      )
      delete bundle[cssAsset.fileName]

      const pageNames = ['HomePage', 'PeopleListPage', 'PersonDetailPage', 'NotFoundPage']
      const pageChunks = Object.fromEntries(
        pageNames.map((pageName) => {
          const chunk = Object.values(bundle).find(
            (item) => item.type === 'chunk' && item.fileName.includes(`${pageName}-`),
          )
          return [pageName, chunk ? `/${chunk.fileName}` : '']
        }),
      )
      const routePreloadScript = `(()=>{const p=location.pathname;let n='NotFoundPage';if(p==='/')n='HomePage';else if(/^\\/people\\/?$/.test(p))n='PeopleListPage';else if(/^\\/people\\/[^/]+\\/?$/.test(p))n='PersonDetailPage';const h=${JSON.stringify(pageChunks)}[n];if(h){const l=document.createElement('link');l.rel='modulepreload';l.href=h;document.head.append(l)}})();`

      htmlAsset.source = String(htmlAsset.source).replace(
        '</head>',
        `<script>${routePreloadScript}</script></head>`,
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), optimizeInitialRouteAssets()],
})
