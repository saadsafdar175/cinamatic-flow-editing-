/**
 * CineFlow Studio - Professional Offline-First Desktop Video Editor
 * Main Application Shell & View Orchestration
 */

import React, { useState } from 'react';
import { EditorProvider, useEditor } from './context/EditorContext';
import { TopMenuBar } from './components/header/TopMenuBar';
import { LeftNavSidebar } from './components/sidebar/LeftNavSidebar';
import { MediaLibrary } from './components/media/MediaLibrary';
import { VideoPlayer } from './components/player/VideoPlayer';
import { Timeline } from './components/timeline/Timeline';
import { InspectorPanel } from './components/inspector/InspectorPanel';
import { HomeScreen } from './components/home/HomeScreen';
import { ExportModal } from './components/export/ExportModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { WindowsInstallerModal } from './components/desktop/WindowsInstallerModal';

function EditorWorkspace({
  onGoHome,
  onOpenExportModal,
  onOpenSettingsModal,
  onOpenWindowsAppModal,
}: {
  onGoHome: () => void;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenWindowsAppModal: () => void;
}) {
  const { activeTab } = useEditor();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0c0d10] text-[#e1e4ea]">
      {/* 1. Top Menu Bar */}
      <TopMenuBar
        onOpenExportModal={onOpenExportModal}
        onOpenSettingsModal={onOpenSettingsModal}
        onOpenWindowsAppModal={onOpenWindowsAppModal}
        onGoHome={onGoHome}
      />

      {/* 2. Middle Section: Tools Sidebar + Media Drawer + Monitor Center + Inspector Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Tools Navigation */}
        <LeftNavSidebar
          onGoHome={onGoHome}
          onOpenExportModal={onOpenExportModal}
          onOpenSettingsModal={onOpenSettingsModal}
        />

        {/* Media Library Drawer (Visible when Media tool active) */}
        {activeTab === 'media' && <MediaLibrary />}

        {/* Center: Video Preview Monitor */}
        <VideoPlayer />

        {/* Right: Inspector & Adjustments Panel */}
        <InspectorPanel />
      </div>

      {/* 3. Bottom Multi-Track Timeline */}
      <Timeline />
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<'editor' | 'home'>('editor');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWindowsAppOpen, setIsWindowsAppOpen] = useState(false);

  return (
    <EditorProvider>
      {currentView === 'home' ? (
        <HomeScreen
          onEnterEditor={() => setCurrentView('editor')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenWindowsAppModal={() => setIsWindowsAppOpen(true)}
        />
      ) : (
        <EditorWorkspace
          onGoHome={() => setCurrentView('home')}
          onOpenExportModal={() => setIsExportOpen(true)}
          onOpenSettingsModal={() => setIsSettingsOpen(true)}
          onOpenWindowsAppModal={() => setIsWindowsAppOpen(true)}
        />
      )}

      {/* Modals */}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <WindowsInstallerModal isOpen={isWindowsAppOpen} onClose={() => setIsWindowsAppOpen(false)} />
    </EditorProvider>
  );
}
