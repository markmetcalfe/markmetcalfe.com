import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslintPlugin from 'vite-plugin-eslint'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    createHtmlPlugin({
      inject: {
        data:
          process.env.VITE_SITE_NAME === 'vizshun'
            ? {
                title: 'Vizshun',
                description: 'Vizshun: Visual Artist / DJ / Digital Wizard',
                keywords:
                  'vizshun,_vizshun,vj,dj,creative,coding,coder,developer,art,visuals,vjing,resolume,techno,dubstep,psytrance,dub,house',
                image: 'https://vizshun.art/social-card-alt.jpg?v=1',
                injectHtml: `<a id="ga-insta-link" style="display:block;position:absolute;bottom:20px;right:20px;font-size:10px;color:#000!important;opacity:0!important" href="https://www.instagram.com/_vizshun/">@vizshun</a>
                <a id="ga-insta-link" style="display:block;position:absolute;bottom:20px;right:20px;font-size:10px;color:#000!important;opacity:0!important" href="https://www.instagram.com/_vizshun/">@_vizshun</a>`,
              }
            : {
                title: 'Mark Metcalfe',
                description: 'Mark Metcalfe: Developer / Digital Wizard',
                keywords:
                  'mark,metcalfe,developer,software,engineer,web,coder,javascript,java,kotlin,php,vue,vuejs,typescript',
                image: 'https://markmetcalfe.com/social-card.jpg?v=4',
                injectHtml: '',
              },
      },
    }),
    eslintPlugin({
      failOnError: true,
      failOnWarning: false,
    }),
  ],
})
