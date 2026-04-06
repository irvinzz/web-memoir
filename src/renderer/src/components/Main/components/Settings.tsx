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

import { SpaceSettings } from '@shared';

import { socks5Re } from '@renderer/components/const';
import { useHandleAsyncAction } from '@renderer/hooks/handle-async-action';
import { useTranslation } from '@renderer/localization/hook';

export default function SettingsDialog(props: {
  open: boolean;
  onClose: () => void;

  settings?: SpaceSettings;
  toggleSettings: (input: Partial<SpaceSettings>) => Promise<void>;
}): React.JSX.Element {
  const { onClose, open, settings, toggleSettings } = props;

  const { t } = useTranslation();

  const { handleAsyncAction, prompt } = useHandleAsyncAction();

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
        <DialogTitle>{t('upstreamProxy')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('provideProxyUrl')}</DialogContentText>
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
          <Button onClick={onProxyDialogOK}>{t('ok')}</Button>
          <Button
            onClick={() => {
              setProxyDialogVisible(false);
            }}
          >
            {t('cancel')}
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
                    checked={!!settings?.offline}
                    onChange={(e) => toggleSettings({ offline: e.target.checked })}
                  />
                }
                label={
                  <Typography>
                    {settings?.offline ? t('offlineModeEnabled') : t('offlineModeDisabled')}
                  </Typography>
                }
              />
            </ListItem>
            <ListItem alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings?.useUpstreamProxy}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProxyDialogVisible(true);
                      } else {
                        handleAsyncAction(async () => {
                          await toggleSettings({
                            useUpstreamProxy: false,
                          });
                        });
                      }
                    }}
                  />
                }
                label={<Typography>{t('upstreamProxy')}</Typography>}
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
                label={<Typography>{t('allowLarge')}</Typography>}
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
                label={<Typography>{t('keepMedia')}</Typography>}
              />
            </ListItem> */}
            <ListItem alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings?.private}
                    onChange={(e) => toggleSettings({ private: e.target.checked })}
                  />
                }
                label={<Typography>{t('private')}</Typography>}
              />
            </ListItem>
            <ListItem alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings?.customBrowser}
                    onChange={(e) => toggleSettings({ customBrowser: e.target.checked })}
                  />
                }
                label={<Typography>{t('useExternalWebBrowser')}</Typography>}
              />
            </ListItem>
            <ListItem alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings?.pinCustomPort}
                    onChange={(e) => {
                      (async () => {
                        if (e.target.checked) {
                          const answer = await prompt<number>(
                            {
                              title: t('pinCustomPort'),
                              content: ({ value, onChange }) => (
                                <>
                                  <TextField
                                    type="number"
                                    slotProps={{
                                      htmlInput: {
                                        min: '1024',
                                        max: '65535',
                                      },
                                    }}
                                    value={value}
                                    onChange={(e) => {
                                      const parsed = Number.parseInt(e.target.value, 10);
                                      onChange({ value: parsed });
                                    }}
                                  />
                                </>
                              ),
                            },
                            settings?.pinCustomPort
                          );
                          if ('cancelled' in answer) {
                            return;
                          }
                          handleAsyncAction(async () => {
                            const port = answer.value;
                            if (port >= 1024 && port <= 65535) {
                              await toggleSettings({ pinCustomPort: answer.value });
                            } else {
                              throw new Error(`Port must be from 1024 to 65535`);
                            }
                          });
                        } else {
                          handleAsyncAction(async () => {
                            await toggleSettings({ pinCustomPort: undefined });
                          });
                        }
                      })();
                    }}
                  />
                }
                label={
                  <Typography>
                    {t('pinCustomPort')} {settings?.pinCustomPort && `(${settings?.pinCustomPort})`}
                  </Typography>
                }
              />
            </ListItem>
            <ListItem alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings?.allowNetwork}
                    onChange={(e) => toggleSettings({ allowNetwork: e.target.checked })}
                  />
                }
                label={<Typography>{t('allowNetworkAccess')}</Typography>}
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
