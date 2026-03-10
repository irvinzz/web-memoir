import { useRef, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import { useService } from '@renderer/hooks/use-service';
import { useHandleAsyncAction } from '@renderer/hooks/handle-async-action';
import { Space } from '@shared';
import { useTranslation } from '@renderer/localization/hook';

function Main(props: { space: Space }): React.JSX.Element {
  const { space } = props;
  const { t } = useTranslation();
  const { handleAsyncAction } = useHandleAsyncAction();
  const [
    installCertificateConfirmationDialogVisible,
    setInstallCertificateConfirmationDialogVisible,
  ] = useState<boolean>(false);

  const [manualLaunchDialogVisible, setManualLaunchDialogVisible] = useState<{
    visible: boolean;
    port: number;
  } | null>(null);

  const startBrowser = async (ignoreSSLError = false): Promise<void> => {
    const launchResult = await window.api.startBrowser(space.name, ignoreSSLError);
    switch (launchResult.code) {
      case 'OK': {
        return;
      }
      case 'CERT_NOT_INSTALLED': {
        setInstallCertificateConfirmationDialogVisible(true);
        break;
      }
      default:
        throw new Error(launchResult.code);
    }
  };

  const handleInstallCertificateCancel = async (): Promise<void> => {
    setInstallCertificateConfirmationDialogVisible(false);
  };

  const handleInstallCertificateIgnore = (): void => {
    setInstallCertificateConfirmationDialogVisible(false);
    startBrowser(true);
  };

  const handleInstallCertificeAgree = async (): Promise<void> => {
    setInstallCertificateConfirmationDialogVisible(false);
    await window.api.installCertificate();
    await startBrowser(false);
  };

  const {
    enableService,
    disableService,
    enabled: resolvedServiceEnabled,
    settings,
    toggleSettings,
    describeInstance,
  } = useService(space.name);

  const proxyRef = useRef<HTMLInputElement>(null);
  const handleCopy = (): void => {
    const value = proxyRef.current?.value ?? '';
    window.api.putToClipboard(value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '80vh',
        flexDirection: 'column',
      }}
    >
      <FormControlLabel
        control={
          <Switch
            checked={resolvedServiceEnabled}
            color={resolvedServiceEnabled ? 'success' : 'error'}
            onChange={() => {
              handleAsyncAction(async () => {
                await (resolvedServiceEnabled ? disableService() : enableService());
              });
            }}
          />
        }
        label={resolvedServiceEnabled ? 'Service started' : 'Service stopped'}
      />
      <FormControlLabel
        control={
          <Switch
            checked={settings.offline}
            color={settings.offline ? 'error' : 'default'}
            onChange={(e) => {
              handleAsyncAction(async () => {
                await toggleSettings({ offline: e.target.checked });
              });
            }}
          />
        }
        label={settings.offline ? t('offlineModeEnabled') : t('offlineModeDisabled')}
      />
      <ButtonGroup variant="contained">
        <Button
          variant="contained"
          color="info"
          disabled={!resolvedServiceEnabled}
          onClick={() => {
            handleAsyncAction(async () => {
              await startBrowser();
            });
          }}
        >
          {t('launchBrowser')}
        </Button>
        <Button color="info" disabled={!resolvedServiceEnabled}>
          <SettingsIcon
            onClick={() => {
              handleAsyncAction(async () => {
                const result = await describeInstance();
                if (!result) throw new Error('PROXY_INSTANCE_MISSING');
                setManualLaunchDialogVisible({
                  visible: true,
                  port: result.port,
                });
              });
            }}
          />
        </Button>
      </ButtonGroup>

      <Dialog open={manualLaunchDialogVisible?.visible || false}>
        <DialogTitle></DialogTitle>
        <DialogContent>
          <Box sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Typography variant="body1" fontWeight="medium">
                  {t('step1InstallCertificate')}
                </Typography>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleAsyncAction(async () => {
                      await window.api.openCertiticateFolder();
                    });
                  }}
                >
                  {t('browseCertificate')}
                </Button>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="body1" fontWeight="medium">
                  {t('step2SetHttpsProxy')}
                </Typography>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={`https://localhost:${manualLaunchDialogVisible?.port}`}
                  disabled
                  inputRef={proxyRef}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" aria-label="copy proxy" onClick={handleCopy}>
                            <ContentCopyIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setManualLaunchDialogVisible(null);
            }}
          >
            {t('close')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={installCertificateConfirmationDialogVisible}
        onClose={() => {
          //
        }}
      >
        <DialogTitle>{t('certificateMissing')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('letsInstallCertificate')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleAsyncAction(() => handleInstallCertificateCancel())}>
            {t('cancel')}
          </Button>
          <Button onClick={() => handleAsyncAction(() => handleInstallCertificeAgree())} autoFocus>
            {t('agree')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Main;
