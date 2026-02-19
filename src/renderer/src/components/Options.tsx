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
} from "@mui/material";
import { useService } from "@renderer/hooks/use-service";
import { useState } from "react";

const socks5Re = /^(?<scheme>socks5):\/\/(?:(?<user>[^:@]+)(?::(?<pass>[^@]*))?@)?(?<host>(?:\d{1,3}\.){3}\d{1,3}|[A-Za-z0-9.-]+):(?<port>\d{1,5})$/;

function Options(): React.JSX.Element {
  const {
    toggleOption,
    options,
  } = useService();

  const [proxyDialogVisible, setProxyDialogVisible] = useState(false);
  const [upstreamProxyValue, setUpstreamProxyValue] = useState('');
  const [upstreamProxyValueInvalid, setUpstreamProxyValueInvalid] = useState(false);

  function onProxyDialogOK() {
    if (socks5Re.test(upstreamProxyValue)) {
      toggleOption({
        upstreamProxyAddress: upstreamProxyValue,
        useUpstreamProxy: true,
      });
      setProxyDialogVisible(false);
    } else {
      setUpstreamProxyValueInvalid(true);
    }
  }

  return (<>
    <Dialog
      open={proxyDialogVisible}
    >
      <DialogTitle>
        Upstream Proxy
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please provide proxy URL
        </DialogContentText>
        <TextField
          error={upstreamProxyValueInvalid}
          placeholder='socks5://127.0.0.1:8001'
          value={upstreamProxyValue}
          onChange={(e) => {
            setUpstreamProxyValue(e.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onProxyDialogOK}>
          OK
        </Button>
        <Button onClick={() => {
          setProxyDialogVisible(false);
        }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
    <List>
      <ListItem alignItems='center'>
        <Typography>
          Upstream Proxy
        </Typography>
        <Switch
          checked={!!options.useUpstreamProxy}
          onChange={(e) => {
            if (e.target.checked) {
              // alert('show proxy dialog');
              setProxyDialogVisible(true);
            } else {
              toggleOption({
                useUpstreamProxy: false,
              });
            }
            // toggleOption({
            //   upstreamProxy: e.target.checked ? undefined : 'true',
            // });
          }}
        />
      </ListItem>
      {/*<ListItem alignItems='center'>
        <Typography>
          Cache share
        </Typography>
        <Switch
          checked={!!options.cacheShare}
          onChange={(e) => toggleOption({ cacheShare: e.target.checked })}
        />
      </ListItem>*/}
      <ListItem alignItems='center'>
        <Typography>
          Allow large
        </Typography>
        <Switch
          checked={!!options.allowLarge}
          onChange={(e) => toggleOption({ allowLarge: e.target.checked })}
        />
      </ListItem>
      <ListItem alignItems='center'>
        <Typography>
          Keep Media
        </Typography>
        <Switch
          checked={!!options.allowMedia}
          onChange={(e) => toggleOption({ allowMedia: e.target.checked })}
        />
      </ListItem>
    </List>
  </>);
}

export default Options;
