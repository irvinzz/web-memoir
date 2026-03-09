import { Button } from '@mui/material';
import { Space } from '@shared';
import { useHandleAsyncAction } from '@renderer/hooks/handle-async-action';

function Tools(props: { space: Space }): React.JSX.Element {
  const { space } = props;
  const { handleAsyncAction } = useHandleAsyncAction();
  return (
    <>
      <Button
        onClick={() => {
          handleAsyncAction(async () => {
            await window.api.runCrawler(space.name, 'https://primereact.org/', {});
          });
        }}
      >
        Crawl
      </Button>
    </>
  );
}

export default Tools;
