import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Tech Archive",
  description: "AI 연구 및 기술 개인 아카이브",
  base: '/tech-archive/',

  themeConfig: {
    logo: '🧠',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Agent', link: '/agent/' },
    ],

    sidebar: {
      '/agent/': [
        {
          text: 'LLM / AI Agent',
          items: [
            { text: '개요', link: '/agent/' },
            { text: 'Harness Engineering 이란?', link: '/agent/harness-engineering' },
            { text: 'Hermes Agent (26.05)', link: '/agent/hermes-agent' },
            { text: 'DSPy', link: '/agent/dspy' },
            { text: 'GEPA', link: '/agent/gepa' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yellofi' }
    ],

    footer: {
      message: 'Personal tech research archive',
    },

    search: {
      provider: 'local'
    }
  }
})
