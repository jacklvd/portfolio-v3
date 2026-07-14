import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGithubProjects } from '@/lib/projects';
import { fetchReadme } from '@/lib/projects/readme';
import { ProjectDetailView } from './project-detail-view';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ProjectDetailPageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata(
	props: ProjectDetailPageProps
): Promise<Metadata> {
	const params = await props.params;
	const projects = await getGithubProjects();
	const project = projects.find(p => p.slug === params.slug);
	if (!project) {
		return { title: 'Project not found — Jack Vo' };
	}
	return {
		title: `${project.title} — Jack Vo`,
		description: project.description,
	};
}

export default async function ProjectDetailPage(props: ProjectDetailPageProps) {
	const params = await props.params;
	const projects = await getGithubProjects();
	const project = projects.find(p => p.slug === params.slug);
	if (!project) notFound();

	const body = project.detail || (await fetchReadme(project.source));

	return <ProjectDetailView project={project} body={body} />;
}
