/**
 * CineFlow Studio - Project Storage and .cineflow File Management
 * Non-destructive autosave, recent projects list, and native .cineflow format
 */

import { EditorProject } from '../types/editor';

const AUTOSAVE_STORAGE_KEY = 'cineflow_autosave_project';
const RECENT_PROJECTS_KEY = 'cineflow_recent_projects_index';

export interface RecentProjectItem {
  id: string;
  name: string;
  aspectRatio: string;
  duration: number;
  updatedAt: number;
  trackCount: number;
  clipCount: number;
}

/**
 * Saves project locally to browser localStorage for recovery and autosave
 */
export function saveProjectToLocalStorage(project: EditorProject): boolean {
  try {
    const serialized = JSON.stringify(project);
    localStorage.setItem(AUTOSAVE_STORAGE_KEY, serialized);

    // Update recent projects index
    updateRecentProjectsIndex(project);
    return true;
  } catch (err) {
    console.error('Failed to autosave project to localStorage', err);
    return false;
  }
}

/**
 * Loads project from autosave
 */
export function loadProjectFromLocalStorage(): EditorProject | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EditorProject;
  } catch (err) {
    console.error('Failed to load project from localStorage', err);
    return null;
  }
}

/**
 * Downloads project as a native .cineflow JSON file
 */
export function exportCineflowFile(project: EditorProject) {
  const jsonString = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.settings.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.cineflow`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports project from an uploaded .cineflow file
 */
export async function importCineflowFile(file: File): Promise<EditorProject> {
  const text = await file.text();
  const parsed = JSON.parse(text) as EditorProject;
  if (!parsed.settings || !parsed.tracks) {
    throw new Error('Invalid .cineflow project file format');
  }
  return parsed;
}

/**
 * Lists recent projects
 */
export function getRecentProjects(): RecentProjectItem[] {
  try {
    const raw = localStorage.getItem(RECENT_PROJECTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentProjectItem[];
  } catch {
    return [];
  }
}

function updateRecentProjectsIndex(project: EditorProject) {
  try {
    const existing = getRecentProjects();
    const clipCount = project.tracks.reduce((acc, t) => acc + t.clips.length, 0);

    const newItem: RecentProjectItem = {
      id: project.settings.id,
      name: project.settings.name,
      aspectRatio: project.settings.aspectRatio,
      duration: project.settings.duration,
      updatedAt: Date.now(),
      trackCount: project.tracks.length,
      clipCount,
    };

    const filtered = existing.filter((item) => item.id !== project.settings.id);
    const updated = [newItem, ...filtered].slice(0, 10); // keep last 10

    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
