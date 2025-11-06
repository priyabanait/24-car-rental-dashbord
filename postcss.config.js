import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// PostCSS config for Tailwind v3 (ES module syntax because package.json sets "type": "module")
export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
  ],
}