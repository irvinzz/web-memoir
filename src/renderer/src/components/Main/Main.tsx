import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  TextField,
} from '@mui/material';

import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import SmartToyOutlined from '@mui/icons-material/SmartToyOutlined';

import { Space } from '@shared';

import { useService } from '@renderer/hooks/use-service';
import { useHandleAsyncAction } from '@renderer/lib/async-handler';
import { useGlobalDialogs } from '@renderer/lib/global-dialog';
import { useTranslation } from '@renderer/localization/hook';
import { useSpaces } from '@renderer/hooks/use-spaces';

import SpaceManager from './components/SpaceManager';
import { ManualLaunchDialog } from './components/ManualLaunch';

function Main(): React.JSX.Element {
  const { t } = useTranslation();
  const { handleAsyncAction } = useHandleAsyncAction();
  const { prompt } = useGlobalDialogs();
  const [
    installCertificateConfirmationDialogVisible,
    setInstallCertificateConfirmationDialogVisible,
  ] = useState<boolean>(false);

  const [manualLaunchDialogVisible, setManualLaunchDialogVisible] = useState<{
    visible: boolean;
    port: number;
  } | null>(null);

  const {
    activeSpaceName,
    setActiveSpace,
    spaces,
    addSpace,
    removeSpace,
    importSpace,
    toggleSettings,
  } = useSpaces();

  const {
    startService,
    disableService,
    enabled: resolvedServiceEnabled,
  } = useService(activeSpaceName);

  const startBrowser = async (ignoreSSLError = false): Promise<void> => {
    if (!activeSpaceName) return;
    const launchResult = await window.api.startBrowser(activeSpaceName, ignoreSSLError);
    switch (launchResult.code) {
      case 'OK': {
        return;
      }
      case 'CERT_MISMATCH':
      case 'CERT_NOT_INSTALLED': {
        setInstallCertificateConfirmationDialogVisible(true);
        break;
      }
      default:
        throw new Error(`Unhandled error '${launchResult.code}': ${launchResult.message}`);
    }
  };

  const handleInstallCertificateCancel = async (): Promise<void> => {
    setInstallCertificateConfirmationDialogVisible(false);
  };

  const handleInstallCertificateIgnore = async (): Promise<void> => {
    setInstallCertificateConfirmationDialogVisible(false);
    await startBrowser(true);
  };

  const handleInstallCertificateAgree = async (): Promise<void> => {
    const installResult = await window.api.installCertificate();
    switch (installResult.code) {
      case 'OK': {
        await startBrowser(false);
        setInstallCertificateConfirmationDialogVisible(false);
        break;
      }
      case 'UNHANDLED_ERROR': {
        throw new Error(`Unhandled error '${installResult.code}': ${installResult.error}`);
      }
    }
  };

  const handleSpaceChange = (spaceName: string): void => {
    const newActiveSpace = spaces[spaceName];
    if (!newActiveSpace) return;
    setActiveSpace(spaceName);
  };

  const handleAddSpace = async (spaceName: string, newSpace: Space): Promise<void> => {
    if (spaces[spaceName]) {
      return;
    }
    await addSpace(spaceName, newSpace);
    await setActiveSpace(spaceName);
  };

  const activeSpace = useMemo(() => {
    if (!activeSpaceName) return undefined;
    return spaces[activeSpaceName];
  }, [activeSpaceName, spaces]);

  function onBrowseButtonClicked(mode: 'online' | 'offline'): void {
    handleAsyncAction(async () => {
      if (!activeSpaceName) return;
      if (mode === 'offline') {
        if (!activeSpace?.settings?.offline) {
          await toggleSettings(activeSpaceName, { offline: true });
        }
      } else if (mode === 'online') {
        if (activeSpace?.settings?.offline) {
          await toggleSettings(activeSpaceName, { offline: false });
        }
      }
      if (resolvedServiceEnabled) {
        await disableService();
      } else {
        const startResult = await startService();
        if (startResult.code === 'MSVC_RUNTIME_MISSING') {
          alert(
            [
              'MSVC Runtime missing',
              `Please install it first 'https://aka.ms/vs/17/release/vc_redist.x64.exe'`,
            ].join('\n')
          );
        } else if (startResult.code === 'OK') {
          if (spaces[activeSpaceName!].settings?.customBrowser) {
            setManualLaunchDialogVisible({
              visible: true,
              port: startResult.data!.port,
            });
          } else {
            await startBrowser();
          }
        }
      }
    });
  }

  const [crawlButtonIsLoading, setCrawlButtonIsLoading] = useState(false);

  function onCrawlButtonClicked(): void {
    handleAsyncAction(async () => {
      if (!activeSpaceName) return;
      const answer = await prompt<{
        startUrl: string;
        runInForeground: boolean;
        startUrlError?: string;
      }>(
        {
          title: t('crawler'),
          validate: (input) => {
            const parsedUrl = URL.parse(input.startUrl);
            if (!parsedUrl || !['http:', 'https:'].includes(parsedUrl.protocol)) {
              return {
                startUrl: t('invalidUrl'),
              };
            }
            return true;
          },
          content({ value, onChange, errors }) {
            return (
              <>
                <DialogContentText>{t('enterUrl')}</DialogContentText>
                <TextField
                  error={Boolean(errors?.startUrl)}
                  helperText={errors?.startUrl}
                  placeholder="https://example.org"
                  value={value?.startUrl}
                  onChange={(e) => {
                    onChange({
                      value: {
                        ...value,
                        startUrl: e.target.value,
                        startUrlError: undefined,
                      },
                    });
                  }}
                />
                <DialogContentText>{t('runInForeground')}</DialogContentText>
                <Switch
                  value={value?.runInForeground}
                  onChange={(e) =>
                    onChange({ value: { ...value, runInForeground: e.target.checked } })
                  }
                />
              </>
            );
          },
        },
        {
          startUrl: '',
          runInForeground: false,
        }
      );

      if ('cancelled' in answer) {
        return;
      }

      try {
        setCrawlButtonIsLoading(true);

        if (!resolvedServiceEnabled) {
          await startService();
        }
        const {
          value: { runInForeground, startUrl },
        } = answer;
        await window.api.runCrawler(activeSpaceName, startUrl, { runInForeground });
      } finally {
        setCrawlButtonIsLoading(false);
      }
    }, false);
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <SpaceManager
          activeSpaceName={activeSpaceName}
          onSpaceChange={handleSpaceChange}
          availableSpaces={spaces}
          onSpaceAdd={handleAddSpace}
          onSpaceRemove={(space) => removeSpace(space)}
          onImportSpace={() => importSpace()}
          toggleSettings={toggleSettings}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '80vh',
          flexDirection: 'column',
        }}
      >
        <Box>
          <ButtonGroup variant="contained">
            <Button
              variant="contained"
              color={resolvedServiceEnabled ? 'error' : 'primary'}
              startIcon={<TravelExploreIcon />}
              onClick={() => {
                onBrowseButtonClicked('online');
              }}
              disabled={activeSpace?.settings?.offline}
            >
              {resolvedServiceEnabled ? t('stop') : t('browseOnline')}
            </Button>
            {manualLaunchDialogVisible && (
              <ManualLaunchDialog
                port={manualLaunchDialogVisible.port}
                onClose={() => setManualLaunchDialogVisible(null)}
              />
            )}
            <Button
              variant="contained"
              color="secondary"
              title={t('crawlHint')}
              loading={crawlButtonIsLoading}
              onClick={onCrawlButtonClicked}
              disabled={activeSpace?.settings?.offline}
            >
              <SmartToyOutlined />
            </Button>
            <Button
              variant="contained"
              color={resolvedServiceEnabled ? 'error' : 'warning'}
              startIcon={<TravelExploreIcon />}
              onClick={() => {
                onBrowseButtonClicked('offline');
              }}
              disabled={!activeSpace?.settings?.offline}
            >
              {resolvedServiceEnabled ? t('stop') : t('browseOffline')}
            </Button>
          </ButtonGroup>
          {/* Install certificate */}
          <Dialog open={installCertificateConfirmationDialogVisible}>
            <DialogTitle>{t('certificateMissing')}</DialogTitle>
            <DialogContent>
              <DialogContentText>{t('letsInstallCertificate')}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleAsyncAction(() => handleInstallCertificateCancel())}>
                {t('cancel')}
              </Button>
              <Button
                onClick={() => handleAsyncAction(() => handleInstallCertificateAgree())}
                autoFocus
              >
                {t('agree')}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </>
  );
}

export default Main;
