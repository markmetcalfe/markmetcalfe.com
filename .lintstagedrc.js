module.exports = {
  '**/*.{js,json,ts,vue,jsx,tsx}': ['prettier --write'],
  '**/*.{js,ts,vue,jsx,tsx}': ['eslint --fix'],
  'src/**/*.vue': ['stylelint --fix'],
  '**/*.{ts,tsx,vue}': () => 'vue-tsc --noEmit',
}
