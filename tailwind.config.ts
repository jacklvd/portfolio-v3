import { text } from 'stream/consumers'
import type { Config } from 'tailwindcss'

const {
  default: flattenColorPalette,
} = require('tailwindcss/lib/util/flattenColorPalette')

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        background: {
          'dark-custom': '#000814',
          'semi-dark-custom': '#1b263b',
          'dark-blue-custom': '#003566',
          'yellow-orange': '#ffc300',
          'yellow-custom': '#ffd60a',
          'blue-grey-custom': '#415a77',
          'light-blue-custom': '#778da9',
          'white-custom': '#cbd5e1',
          'pallete-1': '#edede9',
          'pallete-2': '#d6ccc2',
          'pallete-3': '#f5ebe0',
          'pallete-4': '#e3d5ca',
          'pallete-5': '#d5bdaf',
        },
        text: {
          'dark-custom': '#000814',
          'semi-dark-custom': '#1b263b',
          'dark-blue-custom': '#003566',
          'yellow-orange': '#ffc300',
          'yellow-custom': '#ffd60a',
          'blue-grey-custom': '#415a77',
          'light-blue-custom': '#778da9',
          'white-custom': '#e0e1dd',
          'pallete-1': '#edede9',
          'pallete-2': '#d6ccc2',
          'pallete-3': '#f5ebe0',
          'pallete-4': '#e3d5ca',
          'pallete-5': '#d5bdaf',
        },
      },
    },
  },
  plugins: [addVariablesForColors],
}

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme('colors'))
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val]),
  )

  addBase({
    ':root': newVars,
  })
}

export default config
