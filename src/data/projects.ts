import { Project, ProjectStatus } from '@/types/project'

export const PROJECT_STATUSES: ProjectStatus[] = [
  'In production',
  'In progress',
  'Paused',
  'Archived',
]

export const projects: Project[] = [
  {
    id: 'my-space',
    name: 'My Space',
    motivation:
      'Build a personal hub to write, save resources, and showcase projects with a fast minimal UI.',
    status: 'In progress',
    year: '2025',
    summary:
      'A personal "OS": Writing + Bookmarks + Projects, with auth and an editor.',
    links: {
      code: 'https://github.com/...',
      live: 'https://...',
    },
    // TODO: reemplaza por screenshots reales en /public/static/projects/my-space.webp
    screenshots: [
      { src: '/static/meta/me.webp', alt: 'Screenshot de My Space' },
    ],
    tech: {
      stack: ['Next.js', 'React', 'Tailwind', 'Supabase', 'Vercel'],
      architecture:
        'App Router + RSC for content. Internal APIs for sync/automation. Supabase for auth + DB.',
      technicalProblemSolved:
        'Keep content synced (Medium/Dev.to) while serving it with great SEO + performance.',
      keyDecisions: [
        'Used Server Components for SEO and performance.',
        'RLS in Supabase to enforce per-user data access.',
        'Webhook + cron for sync and scheduled jobs.',
      ],
      diagram: {
        title: 'Architecture (simple)',
        lines: [
          'UI (Next.js App Router)',
          '  -> Server Components (SEO)',
          '  -> API Routes (sync, editor)',
          'Supabase (Auth + DB + RLS)',
          'Cron/Webhooks (content sync)',
        ],
      },
    },
    impact: {
      metrics: [
        { label: 'Users', value: '—', note: 'Fill in once live' },
        { label: 'Usage', value: '—', note: 'e.g. sessions/week' },
      ],
      results: [
        'Reduced time spent publishing/organizing content.',
        'Centralized portfolio + notes + resources in one place.',
      ],
      learnings: [
        'Separating “data” from “presentation” speeds up UI iteration.',
      ],
    },
  },
  {
    id: 'open-source-toolkit',
    name: 'Open Source Toolkit',
    motivation:
      'Publish a toolkit to speed up projects (linting, UI primitives, templates).',
    status: 'In production',
    year: '2024',
    summary: 'Templates and components to start new projects quickly.',
    links: {
      code: 'https://github.com/...',
    },
    tech: {
      stack: ['TypeScript', 'React', 'ESLint', 'Prettier', 'CI'],
      technicalProblemSolved:
        'Standardize quality and DX to avoid redoing setup work for every project.',
      keyDecisions: [
        'CI with lint/test/build checks.',
        'Semantic versioning + changelog.',
      ],
    },
    impact: {
      metrics: [
        { label: 'Repos using it', value: '—' },
        { label: 'Time saved', value: '—', note: 'Initial setup' },
      ],
      results: ['Menos fricción en los primeros commits y PRs.'],
      learnings: [
        'Las “decisiones por defecto” importan más que la documentación.',
      ],
    },
  },
  {
    id: 'mobile-experiment',
    name: 'Mobile Experiment',
    motivation:
      'Explore mobile UX and performance on large lists with smart caching.',
    status: 'Paused',
    year: '2023',
    summary: 'Navigation experiment + offline-first.',
    links: {
      code: 'https://github.com/...',
    },
    tech: {
      stack: ['React Native', 'TypeScript'],
      architecture: 'Offline-first + device cache + sync queues.',
      keyDecisions: ['Batch sync to reduce battery and network usage.'],
    },
    impact: {
      results: ['Improved perceived latency for scroll and navigation.'],
      learnings: [
        'La UX “offline” necesita estados claros y recuperación robusta.',
      ],
    },
  },
  {
    id: 'heyfrwrd',
    name: 'Heyfrwrd',
    motivation:
      'Build an AI agent for Instagram sales to help me sell my products.',
    status: 'In progress',
    year: '2025',
    summary: 'AI agent for Instagram sales.',
    links: {
      code: 'https://github.com/...',
    },
    tech: {
      stack: ['Next.js', 'React', 'Tailwind', 'Supabase', 'Vercel'],
      architecture:
        'App Router + RSC for content. Internal APIs for sync/automation. Supabase for auth + DB.',
      technicalProblemSolved:
        'Keep content synced (Medium/Dev.to) while serving it with great SEO + performance.',
    },
    impact: {
      results: ['Improved perceived latency for scroll and navigation.'],
      learnings: [
        'La UX “offline” necesita estados claros y recuperación robusta.',
      ],
    },
  },
]

export function getProjectById(id: string) {
  return projects.find((p) => p.id === id)
}
