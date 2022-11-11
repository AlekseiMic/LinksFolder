/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['apps/links-folder/src/**/*.html'],
  theme: {
    extend: {
      height: {
        header: 'var(--header-height)',
        main: 'var(--main-height)',
      },
      boxShadow: {
        default: 'var(--shadow)',
        primary: 'var(--shadow-primary)',
      },
      padding: {
        header: 'var(--header-height)',
      },
      margin: {
        header: 'var(--header-height)',
      },
      colors: {
        login: 'var(--login)',
        loginHover: 'var(--login-hover)',
        loginFocus: 'var(--login-focus)',
        logout: 'var(--logout)',
        logoutHover: 'var(--logout-hover)',
        logoutFocus: 'var(--logout-focus)',
        themeSwitch: 'var(--theme-switch)',
        themeSwitchHover: 'var(--theme-switch-hover)',
        themeSwitchFocus: 'var(--theme-switch-focus)',
        header: 'var(--header)',
        headerBg: 'var(--header-bg)',
        primary: 'var(--primary)',
        primary90: 'var(--primary-90)',
        default: 'var(--default)',
        defaultInv: 'var(--default-inv)',
        default30: 'var(--default-30)',
        default60: 'var(--default-60)',
        default110: 'var(--default-110)',
        default110Inv: 'var(--default-110-inv)',
        danger: 'var(--danger)',
        danger90: 'var(--danger-90)',
        danger110: 'var(--danger-110)',
        warning: 'var(--warning)',
        warningInv: 'var(--warning-inv)',
      },
    },
  },
  plugins: [],
};
