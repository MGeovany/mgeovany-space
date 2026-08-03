import { Project, ProjectStatus } from '@/types/project'

export const PROJECT_STATUSES: ProjectStatus[] = [
  'In production',
  'In progress',
  'Paused',
  'Archived',
]

export const LOCAL_PROJECTS: Project[] = [
  {
    id: 'rivalo-ios',
    name: 'Rivalo iOS',
    tagline: 'Making match days feel closer from your phone.',
    motivation:
      'Rivalo iOS is inspired by the energy of real sports fans. I wanted to build something that carries the emotion of following a game, the small rituals around checking what is happening, and the feeling of being close to the action even when you are not there.',
    summary:
      'A mobile project shaped around sports, attention, and the excitement people bring to every match.',
    shortDesc:
      'Inspired by the energy of real sports fans and the idea of making match days feel closer from your phone.',
    status: 'In production',
    year: '2026',
    showOnHome: true,
    links: {},
    tech: { stack: ['iOS'] },
  },
  {
    id: 'soma-tv',
    name: 'Soma TV',
    tagline: 'A calmer shared-screen experience for home.',
    motivation:
      'Soma TV started from wanting a screen experience that feels useful without becoming noisy. I liked the idea of something that can live in a room with people, help them pay attention to what matters, and still feel calm instead of demanding.',
    summary:
      'A TV-focused project about presence, simplicity, and creating something people can comfortably share.',
    shortDesc:
      'Started from wanting a calmer shared-screen experience at home, something useful without feeling noisy.',
    status: 'In production',
    year: '2026',
    showOnHome: true,
    links: {},
    tech: { stack: ['TV'] },
  },
  {
    id: 'allons',
    name: 'Allons',
    tagline: 'Helping people move from idea to action together.',
    motivation:
      'Allons comes from the feeling of getting people moving together. The inspiration was not just building another product, but turning a simple spark into something others can understand, join, and use in real life.',
    summary:
      'A project about momentum, collaboration, and making ideas feel possible sooner.',
    shortDesc:
      'Comes from the feeling of getting people moving together and turning a simple idea into something others can use.',
    status: 'In production',
    year: '2026',
    showOnHome: true,
    links: {},
    tech: { stack: ['Product'] },
  },
  {
    id: 'nocturne-extension',
    name: 'Nocturne Extension',
    tagline: 'A useful browser extension shaped by persistence.',
    motivation:
      'Nocturne Extension was built from the desire to ship something genuinely useful. What makes it personal is the frustration of reaching the publishing step and feeling blocked because of where I am from. It bothers me that being from Honduras can become a barrier, and that frustration became part of the reason to keep building.',
    summary:
      'An extension project about usefulness, ownership, and the unfair friction that can appear when building from Honduras.',
    shortDesc:
      'Built to ship something useful, and it frustrates me that publishing an extension can be blocked just because I am from Honduras.',
    status: 'In production',
    year: '2026',
    showOnHome: true,
    links: {},
    tech: { stack: ['Extension'] },
  },
  {
    id: 'mateo',
    name: 'Mateo',
    tagline: 'A playful project with a personal feeling.',
    motivation:
      'Mateo is inspired by family, curiosity, and the joy of making something simple feel personal. I wanted it to carry a lighter feeling, the kind of project that reminds me that building is also about affection and play, not only work.',
    summary:
      'A personal project built around warmth, playfulness, and making a small idea feel alive.',
    shortDesc:
      'A playful project inspired by family, curiosity, and the joy of making something simple feel personal.',
    status: 'In production',
    year: '2026',
    showOnHome: true,
    links: {},
    tech: { stack: ['Personal'] },
  },
  {
    id: 'velkoz-theme',
    name: 'Velkoz Theme',
    tagline: 'A workspace that feels like mine.',
    motivation:
      'Velkoz Theme came from wanting my tools to feel closer to my taste and my rhythm. When I spend hours building, the environment matters. This project is about shaping that space so it feels personal before the work even starts.',
    summary:
      'A theme project inspired by ownership, mood, and the small details that make a workspace feel right.',
    shortDesc:
      'Made because I like shaping a workspace that feels like mine before spending hours building inside it.',
    status: 'In production',
    year: '2026',
    showOnHome: true,
    links: {},
    tech: { stack: ['Theme'] },
  },
  {
    id: 'personal-finance-ios',
    name: 'Personal Finance iOS',
    tagline: 'Building a healthier relationship with money.',
    motivation:
      'Personal Finance iOS is something I am working on because I want money to feel less confusing and less heavy. The inspiration is not only tracking numbers, but creating a calmer way to understand habits, make better decisions, and remove shame from personal finance.',
    summary:
      'An in-progress iOS project about clarity, calm, and making money feel easier to face.',
    shortDesc:
      'In progress, inspired by wanting a healthier relationship with money without shame or overcomplication.',
    status: 'In progress',
    year: '2026',
    showOnHome: true,
    links: {},
    tech: { stack: ['iOS'] },
  },
  {
    id: 'fintech-day-landing',
    name: 'Fintech Day Landing',
    tagline: 'Making financial conversations feel more human.',
    motivation:
      'Fintech Day Landing is something I am working on because financial products and events can easily feel distant or intimidating. The inspiration is to make that first impression feel more approachable, more human, and easier to trust.',
    summary:
      'An in-progress landing page about trust, clarity, and helping people feel welcome in financial conversations.',
    shortDesc:
      'In progress, inspired by making financial conversations feel more approachable, human, and easier to trust.',
    status: 'In progress',
    year: '2026',
    showOnHome: true,
    links: {},
    tech: { stack: ['Landing'] },
  },
]

export function normalizeProjectName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function mergeWithLocalProjects(projects: Project[]) {
  const localProjectNames = new Set(
    LOCAL_PROJECTS.map((project) => normalizeProjectName(project.name))
  )
  const mergedProjects = [...LOCAL_PROJECTS]

  for (const project of projects) {
    if (localProjectNames.has(normalizeProjectName(project.name))) {
      continue
    }

    mergedProjects.push(project)
  }

  return mergedProjects
}

export function getProjectById(id: string) {
  return LOCAL_PROJECTS.find((project) => project.id === id)
}
