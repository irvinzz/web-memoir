import { Button } from '@mui/material';
import { useHandleAsyncAction } from '@renderer/hooks/handle-async-action';

function About(): React.JSX.Element {
  const { handleAsyncAction } = useHandleAsyncAction();
  return (
    <>
      <Button
        onClick={() => {
          handleAsyncAction(async () => {
            const inspection = await window.api.inspect();
            console.debug(inspection);
            alert(JSON.stringify(inspection, null, 2));
          });
        }}
      >
        Debug
      </Button>
    </>
  );
}

export default About;
