import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "images",
  cleanUrls: true,
  lang: 'en-US',

  title: "Vanilla OS Image Marketplace",
  description: "A collection of Vanilla OS images",
  themeConfig: {
    nav: [
      { text: 'Marketplace', link: '/' },
      { text: 'Vanilla OS', link: 'https://vanillaos.org' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Vanilla-OS' }
    ]
  }
})
