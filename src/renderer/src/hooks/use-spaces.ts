import { Space, SpacesSettings } from '@shared';
import { useEffect, useState } from 'react';

export function useSpaces(): {
  activeSpace: Space | undefined;
  setActiveSpace: (space: Space) => Promise<void>;
  spaces: Space[];
  addSpace: (newSpace: Space) => Promise<void>;
  removeSpace: (space: Space) => Promise<void>;
} {
  const [spacesSettings, setSpacesSettings] = useState<SpacesSettings>();
  const [fetchOperation, setFetchOperation] = useState<Promise<void>>();

  const activeSpace = spacesSettings?.spaces.find(
    (space) => space.name === spacesSettings.activeSpaceName
  );

  useEffect(() => {
    if (fetchOperation) return;
    setFetchOperation(
      (async () => {
        const fetchedSpaces = await window.api.getSpaces();
        setSpacesSettings(fetchedSpaces);
      })()
    );
  }, [fetchOperation]);

  return {
    activeSpace,
    setActiveSpace: async (space) => {
      await window.api.setActiveSpace(space);
      setFetchOperation(undefined);
    },
    spaces: spacesSettings?.spaces || [],
    addSpace: async (newSpace) => {
      await window.api.addSpace(newSpace);
      setFetchOperation(undefined);
    },
    removeSpace: async (space) => {
      await window.api.removeSpace(space);
      setFetchOperation(undefined);
    },
  };
}
