module.exports = {
  '**/*.{js,json,ts,vue,jsx,tsx}': ['prettier --write'],
  '**/*.{js,ts,vue,jsx,tsx}': ['eslint --fix'],
  '**/*.vue': ['stylelint --fix strict'],
  '**/*.{ts,tsx,vue}': () => 'vue-tsc --noEmit',
}
