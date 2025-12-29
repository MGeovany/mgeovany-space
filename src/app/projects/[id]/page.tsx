import { ProjectDetail } from '@/components/projects/project-detail'

export default function Page({ params }: { params: { id: string } }) {
  return <ProjectDetail id={params.id} />
}
