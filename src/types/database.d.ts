interface Blog {
  id: string | number
  title: string
  content?: string
  excerpt?: string | null
  url?: string | null
  description?: string
  source?: 'local' | 'medium' | 'devto'
  published_at?: string | null
  createdAt?: string
  updatedAt?: string
}

interface Bookmark {
  id: number
  title: string
  description: string
  url: string
  tag: BookmarkTag
  createdAt: string
  updatedAt: string
}

interface ProjectIdeas {
  id: number
  title: string
  description: string
  url: string
  createdAt: string
  updatedAt: string
}

enum BookmarkTag {
  TOOLS = 'tools',
  RESOURCES = 'resources',
  WEB = 'web',
  READING = 'reading',
  PORFOLIO = 'porfolio',
  ClearTagPicker = 'clear tag picker',
}
