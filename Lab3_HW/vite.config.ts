import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const inlineSinglePageCss: Plugin = {
  name: 'inline-single-page-css',
  enforce: 'post',
  generateBundle(_options, bundle) {
    const html = bundle['index.html']
    if (!html || html.type !== 'asset') return

    const cssAssets = Object.entries(bundle).filter(
      (entry): entry is [string, typeof html] => entry[0].endsWith('.css') && entry[1].type === 'asset',
    )
    if (cssAssets.length === 0) return

    const inlineStyles = cssAssets
      .map(([, asset]) => `<style>${String(asset.source)}</style>`)
      .join('\n')
    const htmlSource = String(html.source).replace(
      /<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*>\s*/g,
      '',
    )
    html.source = htmlSource.replace('</head>', `${inlineStyles}\n</head>`)
    cssAssets.forEach(([fileName]) => delete bundle[fileName])
  },
}

export default defineConfig({
  plugins: [react(), inlineSinglePageCss],
})
