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
import { useHandleAsyncAction } from '@renderer/lib/async-handler';
import { useTranslation } from '@renderer/localization/hook';
import { useGlobalDialogs } from '@renderer/lib/global-dialog';

export default function SettingsDialog(props: {
  open: boolean;
  onClose: () => void;

  settings?: SpaceSettings;
  toggleSettings: (input: Partial<SpaceSettings>) => Promise<void>;
}): React.JSX.Element {
  const { onClose, open, settings, toggleSettings } = props;

  const { t } = useTranslation();

  const { handleAsyncAction } = useHandleAsyncAction();

  const { prompt } = useGlobalDialogs();

  return (
    <>
      <Dialog open={open}>
        <DialogTitle>{t('settings')}</DialogTitle>
        <DialogContent>
          <List>
            <ListItem alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings?.autostart}
                    onChange={(e) => toggleSettings({ autostart: e.target.checked })}
                  />
                }
                label={<Typography>{t('autostart')}</Typography>}
              />
            </ListItem>
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
                      (async () => {
                        if (e.target.checked) {
                          const answer = await prompt<string>(
                            {
                              title: t('upstreamProxy'),
                              validate(input) {
                                return socks5Re.test(input);
                              },
                              content: ({ value, onChange, errors }) => (
                                <>
                                  <TextField
                                    error={Boolean(errors)}
                                    placeholder="socks5://127.0.0.1:8001"
                                    value={value}
                                    onChange={(e) => {
                                      onChange({ value: e.target.value });
                                    }}
                                  />
                                </>
                              ),
                            },
                            settings?.upstreamProxyAddress
                          );
                          if ('cancelled' in answer) {
                            return;
                          }
                          handleAsyncAction(async () => {
                            await toggleSettings({
                              useUpstreamProxy: true,
                              upstreamProxyAddress: answer.value,
                            });
                          });
                        } else {
                          handleAsyncAction(async () => {
                            await toggleSettings({
                              useUpstreamProxy: false,
                            });
                          });
                        }
                      })();
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
            <ListItem>
              <FormControlLabel
                control={
                  <Switch
                    disabled={!!settings?.customBrowser}
                    checked={!!settings?.useChromeArguments}
                    onChange={(e) => {
                      (async () => {
                        if (e.target.checked) {
                          const answer = await prompt<string>(
                            {
                              title: t('chromeArguments'),
                              content: ({ value, onChange }) => (
                                <>
                                  <TextField
                                    value={value}
                                    onChange={(e) => {
                                      onChange({ value: e.target.value });
                                    }}
                                  />
                                </>
                              ),
                            },
                            settings?.chromeArguments
                          );
                          if ('cancelled' in answer) {
                            return;
                          }
                          handleAsyncAction(async () => {
                            await toggleSettings({
                              useChromeArguments: true,
                              chromeArguments: answer.value,
                            });
                          });
                        } else {
                          handleAsyncAction(async () => {
                            await toggleSettings({ useChromeArguments: false });
                          });
                        }
                      })();
                    }}
                  />
                }
                label={<Typography>{t('chromeArguments')}</Typography>}
              />
            </ListItem>
            <ListItem alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings?.fixedPort}
                    onChange={(e) => {
                      (async () => {
                        if (e.target.checked) {
                          const answer = await prompt<number>(
                            {
                              title: t('fixedPort'),
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
                            settings?.fixedPort
                          );
                          if ('cancelled' in answer) {
                            return;
                          }
                          handleAsyncAction(async () => {
                            const port = answer.value;
                            if (port >= 1024 && port <= 65535) {
                              await toggleSettings({ fixedPort: answer.value });
                            } else {
                              throw new Error(`Port must be from 1024 to 65535`);
                            }
                          });
                        } else {
                          handleAsyncAction(async () => {
                            await toggleSettings({ fixedPort: undefined });
                          });
                        }
                      })();
                    }}
                  />
                }
                label={
                  <Typography>
                    {t('fixedPort')} {settings?.fixedPort && `(${settings?.fixedPort})`}
                  </Typography>
                }
              />
            </ListItem>
            <ListItem alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings?.allowIncomingConnections}
                    onChange={(e) => toggleSettings({ allowIncomingConnections: e.target.checked })}
                  />
                }
                label={<Typography>{t('allowIncomingConnections')}</Typography>}
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
