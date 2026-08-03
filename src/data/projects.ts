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
    tagline: 'A football performance tracker using iPhone and Apple Watch.',
    motivation:
      'Rivalo iOS started because I wanted to measure my own performance in football matches. I found a product on Amazon that solved part of the problem, but it was expensive and depended on extra hardware. I decided to use the Apple Watch instead and build a more accessible way to track match activity.',
    summary:
      'An iOS and Apple Watch project for tracking football match activity without extra hardware.',
    shortDesc:
      'A football tracker built around iPhone and Apple Watch instead of extra hardware.',
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
    tagline: 'A remote control app for LG and Samsung TVs.',
    motivation:
      'Soma TV started because I lost my TV remote and kept postponing buying a replacement. I built an app that connects to LG and Samsung TVs over Wi-Fi using the ports and protocols they expose, so I can control the TV from my phone or Mac.',
    summary:
      'An iOS and macOS remote control project for LG and Samsung TVs over Wi-Fi.',
    shortDesc: 'A Wi-Fi remote control app for LG and Samsung TVs.',
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
    tagline: 'An events platform for organizers and attendees.',
    motivation:
      'Allons was built around the operational needs of events: discovery, reservations, payments, staff workflows, and organizer visibility. The goal is to reduce friction for both attendees and providers.',
    summary: 'A mobile event platform with attendee and provider flows.',
    shortDesc:
      'An events platform for discovery, reservations, and organizer tools.',
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
    tagline: 'A DevTools extension for network and console inspection.',
    motivation:
      'Nocturne Extension was built to make debugging browser requests and console output more structured. The project also reflects the difficulty of publishing developer tools when platform access can depend on country availability, including the limitations I face from Honduras.',
    summary:
      'A browser extension for reviewing network requests, console logs, and debugging context.',
    shortDesc: 'A DevTools extension for network and console debugging.',
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
    tagline: 'A small multiplayer card game.',
    motivation:
      'Mateo was built as a personal card game with simple rules and multiplayer support. The motivation was to turn a familiar, informal game idea into something playable in the browser.',
    summary: 'A browser-based card game with a small real-time server.',
    shortDesc: 'A browser card game with multiplayer support.',
    status: 'In production',
    year: '2026',
    showOnHome: true,
    links: KNOWN_PROJECT_LINKS.mateo,
    tech: { stack: ['JavaScript', 'HTML', 'CSS', 'Node.js', 'Socket.IO'] },
  },
  {
    id: 'velkoz-theme',
    name: 'Velkoz Theme',
    tagline: 'A custom dark theme for VS Code.',
    motivation:
      'Velkoz Theme was created to define a consistent editor environment for daily development. The focus is on contrast, readability, and a color palette that works for long coding sessions.',
    summary:
      'A VS Code theme with a dark palette, warm accents, and readable syntax colors.',
    shortDesc: 'A custom VS Code theme focused on contrast and readability.',
    status: 'In production',
    year: '2026',
    showOnHome: true,
    links: KNOWN_PROJECT_LINKS.velkoztheme,
    tech: { stack: ['JavaScript', 'Node.js', 'VS Code Theme API', 'JSON'] },
  },
  {
    id: 'personal-finance-ios',
    name: 'Personal Finance iOS',
    tagline: 'A personal finance app for planning and review.',
    motivation:
      'Personal Finance iOS is being built to make budgeting, debt tracking, and financial review easier to maintain. The project focuses on clear habits, recurring reviews, and practical planning rather than complex financial dashboards.',
    summary:
      'An in-progress iOS app for budgets, debts, goals, and daily financial review.',
    shortDesc: 'An iOS app for budgeting, debt tracking, and financial review.',
    status: 'In progress',
    year: '2026',
    showOnHome: true,
    links: KNOWN_PROJECT_LINKS.personalfinanceios,
    tech: { stack: ['Swift', 'SwiftUI', 'XcodeGen', 'iOS'] },
  },
  {
    id: 'fintech-day-landing',
    name: 'Fintech Day Landing',
    tagline: 'A landing page for Honduras Fintech Day.',
    motivation:
      'Fintech Day Landing was created to present the event clearly: agenda, sponsors, registration, and event context. The work focuses on credibility, conversion, and making the information easy to navigate.',
    summary:
      'An event landing page with registration, agenda, sponsor sections, and attendee utilities.',
    shortDesc:
      'A landing page for event information, registration, and sponsors.',
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
