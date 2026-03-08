import { Button } from '@mui/material';
import { useHandleAsyncAction } from '@renderer/hooks/handle-async-action';

function Tools(props: { space: string }): React.JSX.Element {
  const { space } = props;
  const { handleAsyncAction } = useHandleAsyncAction();
  return (
    <>
      <Button
        onClick={() => {
          handleAsyncAction(async () => {
            await window.api.runCrawler(space, 'https://primereact.org/', {});
          });
        }}
      >
        Crawl
      </Button>
    </>
  );
}

export default Tools;
