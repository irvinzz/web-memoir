import { Button } from "@mui/material";
import { useHandleAsyncAction } from "@renderer/hooks/handle-async-action";

function Tools(): React.JSX.Element {
  const { handleAsyncAction } = useHandleAsyncAction();
  return (
    <>Tools</>
  );
}

export default Tools;
