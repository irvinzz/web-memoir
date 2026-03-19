import { useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  Switch,
  TextField,
  Typography,

} from '@mui/material';
import { ProxySettings } from '@shared';

import { socks5Re } from '@renderer/components/const';
import { useHandleAsyncAction } from '@renderer/hooks/handle-async-action';
import { useTranslation } from '@renderer/localization/hook';

export default function SettingsDialog(props: {
  open: boolean;
  onClose: () => void;

  settings: ProxySettings;
  toggleSettings: (input: Partial<ProxySettings>) => Promise<void>;
}): React.JSX.Element {
  const { onClose, open, settings, toggleSettings } = props;

  const { t } = useTranslation();

  const { handleAsyncAction } = useHandleAsyncAction();

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
      <Dialog open={open}>
        <DialogTitle>{t('options')}</DialogTitle>
        <DialogContent>
          <List>
            <ListItem alignItems="center">
              <FormControlLabel
                control={
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
                }
                label={<Typography>Upstream Proxy</Typography>}
              />
            </ListItem>
            {/* <ListItem alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings.allowLarge}
                    onChange={(e) => toggleSettings({ allowLarge: e.target.checked })}
                  />
                }
                label={<Typography>Allow large</Typography>}
              />
            </ListItem> */}
            {/* <ListItem alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings.allowMedia}
                    onChange={(e) => toggleSettings({ allowMedia: e.target.checked })}
                  />
                }
                label={<Typography>Keep Media</Typography>}
              />
            </ListItem> */}
            {/*
            <ListItem alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings.private}
                    onChange={(e) => toggleSettings({ private: e.target.checked })}
                  />
                }
                label={<Typography>{t('private')}</Typography>}
              />
            </ListItem>
            */}
            <ListItem alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings.customBrowser}
                    onChange={(e) => toggleSettings({ customBrowser: e.target.checked })}
                  />
                }
                label={<Typography>{t('useExternalWebBrowser')}</Typography>}
              />
            </ListItem>
            {/* <ListItem alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings.allowNetwork}
                    onChange={(e) => toggleSettings({ allowNetwork: e.target.checked })}
                  />
                }
                label={<Typography>Allow network access</Typography>}
              />
            </ListItem> */}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
