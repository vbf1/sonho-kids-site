import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages publica em uma subpasta; outros hosts, como Netlify, usam a raiz.
const base = process.env.GITHUB_ACTIONS === 'true' ? '/sonho-kids-site/' : '/'

export default defineConfig({ plugins: [react], base })
