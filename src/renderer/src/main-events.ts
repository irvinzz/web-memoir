import { MainEventsMap } from '@shared';

type UnbindFunction = () => void;
export function handleApiEvent<K extends keyof MainEventsMap>(
  name: K,
  callback: (payload: MainEventsMap[K]) => void
): UnbindFunction {
  return window.electron.ipcRenderer.on(name, (_event, _data) => {
    callback(_data);
  });
}
