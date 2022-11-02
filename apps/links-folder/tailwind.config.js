/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['apps/links-folder/src/**/*.html'],
  theme: {
    extend: {
      height: {
        header: 'var(--height-header)',
      },
      colors: {
        primary100: 'var(--primary-100)',
        bgPrimary100: 'var(--bg-primary-100)',
        default100: 'var(--default-100)',
        bgDefault100: 'var(--bg-default-100)',
        accent100: 'var(--accent-100)',
        bgAccent100: 'var(--bg-accent-100)',
        lightbulb: 'var(--lightbulb)',
        bgInput: 'var(--bg-input)',
        bgInputWithError: 'var(--bg-input-with-error)',
      },
    },
  },
  plugins: [],
};
