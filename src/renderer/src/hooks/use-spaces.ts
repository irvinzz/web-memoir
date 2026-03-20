import { useCallback, useEffect, useState } from 'react';

import { Space, SpacesConfiguration, SpaceSettings } from '@shared';

export function useSpaces(): {
  activeSpaceName: string | undefined;
  setActiveSpace: (spaceName: string) => Promise<void>;
  spaces: Record<string, Space>;
  addSpace: (spaceName: string, newSpace: Space) => Promise<void>;
  removeSpace: (spaceName: string) => Promise<void>;
  importSpace: () => Promise<void>;
  toggleSettings: (spaceName: string, newSettings: SpaceSettings) => Promise<void>;
} {
  const [spacesSettings, setSpacesSettings] = useState<SpacesConfiguration>();
  const [fetchOperation, setFetchOperation] = useState<Promise<void>>();

  const activeSpace = spacesSettings?.activeSpaceName;

  useEffect(() => {
    if (fetchOperation) return;
    setFetchOperation(
      (async () => {
        const fetchedSpaces = await window.api.getSpaces();
        setSpacesSettings(fetchedSpaces);
      })()
    );
  }, [fetchOperation]);

  const toggleSettings = useCallback(
    async (spaceName: string, settingsChanges: Partial<SpaceSettings>) => {
      if (!spaceName) return;
      const spaceSettings = spacesSettings?.spaces[spaceName];
      if (!spaceSettings) throw new Error(`Space missing`);
      const newSettings: SpaceSettings = {
        ...spaceSettings.settings,
        ...settingsChanges,
      };
      await window.api.applySpaceSettings(spaceName, newSettings);
      setFetchOperation(undefined);
    },
    [spacesSettings?.spaces]
  );

  return {
    activeSpaceName: activeSpace,
    setActiveSpace: async (spaceName) => {
      await window.api.setActiveSpace(spaceName);
      setFetchOperation(undefined);
    },
    spaces: spacesSettings?.spaces || {},
    addSpace: async (spaceName, newSpace) => {
      await window.api.addSpace(spaceName, newSpace);
      setFetchOperation(undefined);
    },
    removeSpace: async (space) => {
      await window.api.removeSpace(space);
      setFetchOperation(undefined);
    },
    importSpace: async () => {
      await window.api.importSpace();
      setFetchOperation(undefined);
    },
    toggleSettings,
  };
}
