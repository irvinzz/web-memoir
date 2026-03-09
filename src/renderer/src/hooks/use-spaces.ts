import { Space } from '@shared';
import { useEffect, useState } from 'react';

export function useSpaces(): {
  activeSpace: Space | undefined;
  setActiveSpace: (space: Space) => void;
  spaces: Space[];
  addSpace: (newSpace: Space) => Promise<void>;
  removeSpace: (space: Space) => Promise<void>;
} {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [fetchOperation, setFetchOperation] = useState<Promise<void>>();
  const [activeSpace, setActiveSpace] = useState<Space>();

  useEffect(() => {
    if (fetchOperation) return;
    setFetchOperation(
      (async () => {
        const fetchedSpaces = await window.api.getSpaces();
        setSpaces(fetchedSpaces);
      })()
    );
  }, [fetchOperation]);

  useEffect(() => {
    if (activeSpace) return;
    setActiveSpace(spaces[0]);
  }, [activeSpace, spaces]);

  return {
    activeSpace,
    setActiveSpace: (space) => {
      setActiveSpace(space);
    },
    spaces,
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
