import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useService } from '@renderer/hooks/use-service';
import { Space } from '@shared';

import { socks5Re } from './const';
import { useHandleAsyncAction } from '@renderer/hooks/handle-async-action';

function Options(props: { space: Space }): React.JSX.Element {
  const { space } = props;

  const { handleAsyncAction } = useHandleAsyncAction();

  const { toggleSettings, settings } = useService(space.name);

  const [proxyDialogVisible, setProxyDialogVisible] = useState(false);
  const [upstreamProxyValue, setUpstreamProxyValue] = useState('');
  const [upstreamProxyValueInvalid, setUpstreamProxyValueInvalid] = useState(false);

  function onProxyDialogOK(): void {
    if (socks5Re.test(upstreamProxyValue)) {
      handleAsyncAction(async () => {
        await toggleSettings({
          upstreamProxyAddress: upstreamProxyValue,
          useUpstreamProxy: true,
        });
        setProxyDialogVisible(false);
      });
    } else {
      setUpstreamProxyValueInvalid(true);
    }
  }

  return (
    <>
      <Dialog open={proxyDialogVisible}>
        <DialogTitle>Upstream Proxy</DialogTitle>
        <DialogContent>
          <DialogContentText>Please provide proxy URL</DialogContentText>
          <TextField
            error={upstreamProxyValueInvalid}
            placeholder="socks5://127.0.0.1:8001"
            value={upstreamProxyValue}
            onChange={(e) => {
              setUpstreamProxyValue(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onProxyDialogOK}>OK</Button>
          <Button
            onClick={() => {
              setProxyDialogVisible(false);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <List>
        <ListItem alignItems="center">
          <Typography>Upstream Proxy</Typography>
          <Switch
            checked={!!settings.useUpstreamProxy}
            onChange={(e) => {
              if (e.target.checked) {
                setProxyDialogVisible(true);
              } else {
                toggleSettings({
                  useUpstreamProxy: false,
                });
              }
            }}
          />
        </ListItem>
        <ListItem alignItems="center">
          <Typography>Allow large</Typography>
          <Switch
            checked={!!settings.allowLarge}
            onChange={(e) => toggleSettings({ allowLarge: e.target.checked })}
          />
        </ListItem>
        <ListItem alignItems="center">
          <Typography>Keep Media</Typography>
          <Switch
            checked={!!settings.allowMedia}
            onChange={(e) => toggleSettings({ allowMedia: e.target.checked })}
          />
        </ListItem>
      </List>
    </>
  );
}

export default Options;
