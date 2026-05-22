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
      { text: 'Profile', link: '/profile' },
    ],

    sidebar: {
      '/agent/': [
        {
          text: 'LLM / AI Agent',
          items: [
            { text: '개요', link: '/agent/' },
            { text: 'Harness Engineering 이란?', link: '/agent/harness-engineering' },
            { text: 'AI 3사 Harness 생태계', link: '/agent/ai-harness-ecosystem' },
            { text: 'Hermes Agent (26.05)', link: '/agent/hermes-agent' },
            { text: 'DSPy', link: '/agent/dspy' },
            { text: 'GEPA', link: '/agent/gepa' },
          ]
        },
        {
          text: 'RAG & Orchestration',
          items: [
            { text: 'RAG', link: '/agent/rag' },
            { text: 'LangChain & LangGraph', link: '/agent/langchain-langgraph' },
            { text: 'LangGraph → Hermes 전환', link: '/agent/langgraph-to-hermes' },
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
