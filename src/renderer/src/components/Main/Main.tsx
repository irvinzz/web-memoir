import { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import SmartToyOutlined from '@mui/icons-material/SmartToyOutlined';

import { Space } from '@shared';

import { useService } from '@renderer/hooks/use-service';
import { useHandleAsyncAction } from '@renderer/hooks/handle-async-action';
import { useTranslation } from '@renderer/localization/hook';
import { useSpaces } from '@renderer/hooks/use-spaces';

import SpaceManager from './components/SpaceManager';
import SettingsDialog from './components/Settings';
import { ManualLaunchDialog } from './components/ManualLaunch';
import { CrawlDialog } from './components/Crawl';

function Main(): React.JSX.Element {
  const { t } = useTranslation();
  const { handleAsyncAction } = useHandleAsyncAction();
  const [
    installCertificateConfirmationDialogVisible,
    setInstallCertificateConfirmationDialogVisible,
  ] = useState<boolean>(false);

  const [crawlDialogVisible, setCrawlDialogVisible] = useState(false);

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

  const handleInstallCertificateIgnore = (): void => {
    setInstallCertificateConfirmationDialogVisible(false);
    startBrowser(true);
  };

  const handleInstallCertificateAgree = async (): Promise<void> => {
    await window.api.installCertificate();
    await startBrowser(false);
    setInstallCertificateConfirmationDialogVisible(false);
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

  function onBrowseButtonClicked(mode: 'online' | 'offline') {
    handleAsyncAction(async () => {
      if (!activeSpaceName) return;
      if (mode === 'offline') {
        if (!spaces[activeSpaceName].settings?.offline) {
          await toggleSettings(activeSpaceName, { offline: true });
        }
      } else if (mode === 'online') {
        if (spaces[activeSpaceName].settings?.offline) {
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
            ].join('\n'),
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

  return (
    <>
      <Box>
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
              onClick={() => {
                setCrawlDialogVisible(true);
              }}
            >
              <SmartToyOutlined />
            </Button>
            {activeSpaceName && (
              <CrawlDialog
                open={crawlDialogVisible}
                onClose={() => setCrawlDialogVisible(false)}
                onOk={async (startUrl, runInForeground) => {
                  if (!resolvedServiceEnabled) {
                    await startService();
                  }
                  await window.api.runCrawler(activeSpaceName, startUrl, { runInForeground });
                }}
              />
            )}
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
        <Box>
          <Button
            variant="contained"
            color={resolvedServiceEnabled ? 'error' : 'warning'}
            startIcon={<TravelExploreIcon />}
            onClick={() => {
              onBrowseButtonClicked('offline');
            }}
          >
            {resolvedServiceEnabled ? t('stop') : t('browseOffline')}
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default Main;
