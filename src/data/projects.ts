import { Project, ProjectStatus } from '@/types/project'

export const PROJECT_STATUSES: ProjectStatus[] = [
  'In production',
  'In progress',
  'Paused',
  'Archived',
]

const PAUSED_PROJECT_NAMES = new Set([
  'pausa',
  'heyfrwrd',
  'sentracli',
  'tabularis',
])

const KNOWN_PROJECT_LINKS: Record<string, Project['links']> = {
  rivaloios: {
    code: 'https://github.com/MGeovany/rivalo-ios',
    live: 'https://rivalo.thefndrs.com/',
  },
  somatv: {
    code: 'https://github.com/MGeovany/soma-tv',
    live: 'https://soma.thefndrs.com/',
  },
  allons: {
    code: 'https://github.com/FNDRS/allons-mobile',
    live: 'https://allonsapp.com/',
  },
  nocturneextension: {
    code: 'https://github.com/MGeovany/nocturne-extension',
    live: 'https://404am.thefndrs.com/',
  },
  mateo: {
    code: 'https://github.com/MGeovany/mateo-game',
    live: 'https://mgeovany.github.io/mateo-game/',
  },
  velkoztheme: {
    code: 'https://github.com/MGeovany/velkoz-theme',
  },
  personalfinanceios: {
    code: 'https://github.com/MGeovany/personal-finance-ios',
  },
  fintechdaylanding: {
    code: 'https://github.com/MGeovany/fintech-day-landing',
    live: 'https://hondurasfintechday.com/',
  },
  pausa: {
    code: 'https://github.com/MGeovany/pausa',
  },
  heyfrwrd: {
    code: 'https://github.com/MGeovany/heyfrwrd-landing',
    live: 'https://heyfrwrd-landing-mgeovanys-projects.vercel.app',
  },
  sentracli: {
    code: 'https://github.com/MGeovany/sentra-monorepo',
    live: 'https://sentra.thefndrs.com/',
  },
  tabularis: {
    code: 'https://github.com/MGeovany/tabularis-web',
    live: 'https://tabularis.thefndrs.com/',
  },
}

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
    links: KNOWN_PROJECT_LINKS.rivaloios,
    tech: {
      stack: ['Swift', 'SwiftUI', 'TCA', 'Supabase', 'PostHog', 'watchOS'],
    },
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
    links: KNOWN_PROJECT_LINKS.somatv,
    tech: {
      stack: ['Swift', 'SwiftUI', 'Swift Package Manager', 'WebSocket', 'SSDP'],
    },
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
    links: KNOWN_PROJECT_LINKS.allons,
    tech: {
      stack: [
        'Expo',
        'React Native',
        'TypeScript',
        'Supabase',
        'NestJS',
        'Prisma',
      ],
    },
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
    links: KNOWN_PROJECT_LINKS.nocturneextension,
    tech: {
      stack: ['TypeScript', 'React', 'Vite', 'WebExtension API', 'Swift'],
    },
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
    links: KNOWN_PROJECT_LINKS.mateo,
    tech: { stack: ['JavaScript', 'HTML', 'CSS', 'Node.js', 'Socket.IO'] },
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
    links: KNOWN_PROJECT_LINKS.velkoztheme,
    tech: { stack: ['JavaScript', 'Node.js', 'VS Code Theme API', 'JSON'] },
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
    links: KNOWN_PROJECT_LINKS.personalfinanceios,
    tech: { stack: ['Swift', 'SwiftUI', 'XcodeGen', 'iOS'] },
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
    links: KNOWN_PROJECT_LINKS.fintechdaylanding,
    tech: {
      stack: [
        'Vite',
        'JavaScript',
        'Tailwind CSS',
        'Three.js',
        'Prisma',
        'Supabase',
      ],
    },
  },
]

export function normalizeProjectName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function isPausedProjectName(name: string) {
  return PAUSED_PROJECT_NAMES.has(normalizeProjectName(name))
}

export function mergeKnownProjectLinks(
  name: string,
  links: Project['links']
): Project['links'] {
  const knownLinks = KNOWN_PROJECT_LINKS[normalizeProjectName(name)]

  return {
    code: links.code || knownLinks?.code,
    live: links.live || knownLinks?.live,
  }
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

export function sortProjectsForList(projects: Project[]) {
  return projects.toSorted((projectA, projectB) => {
    if (projectA.status === projectB.status) {
      return 0
    }

    if (projectA.status === 'Paused') {
      return 1
    }

    if (projectB.status === 'Paused') {
      return -1
    }

    return 0
  })
}

export function getProjectById(id: string) {
  return LOCAL_PROJECTS.find((project) => project.id === id)
}
