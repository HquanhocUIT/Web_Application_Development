import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function optimizeInitialRouteAssets() {
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

      const chunkNames = ['HomePage', 'PeopleListPage', 'PersonDetailPage', 'NotFoundPage', 'people']
      const chunks = Object.fromEntries(
        chunkNames.map((name) => {
          const chunk = Object.values(bundle).find(
            (item) => item.type === 'chunk' && item.fileName.includes(`${name}-`),
          )
          return [name, chunk ? `/${chunk.fileName}` : '']
        }),
      )
      const preloadScript = `(()=>{const p=location.pathname;let n=['NotFoundPage'];if(p==='/')n=['HomePage'];else if(/^\\/people\\/?$/.test(p))n=['PeopleListPage','people'];else if(/^\\/people\\/[^/]+\\/?$/.test(p))n=['PeopleListPage','PersonDetailPage','people'];const c=${JSON.stringify(chunks)};for(const k of n){const h=c[k];if(h){const l=document.createElement('link');l.rel='modulepreload';l.href=h;document.head.append(l)}}})();`
      htmlAsset.source = String(htmlAsset.source).replace(
        '</head>',
        `<script>${preloadScript}</script></head>`,
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), optimizeInitialRouteAssets()],
})
