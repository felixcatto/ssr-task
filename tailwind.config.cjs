const defaultTheme = require('tailwindcss/defaultTheme');

const rem2px = (input, fontSize = 16) => {
  if (input == null) {
    return input;
  }
  switch (typeof input) {
    case 'object':
      if (Array.isArray(input)) {
        return input.map(val => rem2px(val, fontSize));
      } else {
        const ret = {};
        for (const key in input) {
          ret[key] = rem2px(input[key]);
        }
        return ret;
      }
    case 'string':
      return input.replace(/(\d*\.?\d+)rem$/, (_, val) => parseFloat(val) * fontSize + 'px');
    default:
      return input;
  }
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./client/**/*.{js,jsx,ts,tsx}'],
  theme: {
    spacing: rem2px(defaultTheme.spacing),
    extend: {
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.14)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.25), 0 1px 2px -1px rgb(0 0 0 / 0.25)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.25), 0 2px 4px -2px rgb(0 0 0 / 0.25)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.25), 0 4px 6px -4px rgb(0 0 0 / 0.25)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.25), 0 8px 10px -6px rgb(0 0 0 / 0.25)',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      fontSize: {
        'x1.25': ['1.25rem', '1.75rem'],
        'x1.5': ['1.5rem', '1.9rem'],
        'x1.75': ['1.75rem', '2.1rem'],
        x2: ['2rem', '2.25rem'],
        'x2.25': ['2.25rem', '2.5rem'],
        'x2.5': ['2.5rem', '2.65rem'],
        'x2.75': ['2.75rem', '2.85rem'],
        x3: ['3rem', '1'],
        x4: ['4rem', '1'],
        x5: ['5rem', '1'],
      },
    },
  },
  plugins: [],
  corePlugins: { container: false },
};
