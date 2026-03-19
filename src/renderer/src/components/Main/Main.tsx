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
import SettingsIcon from '@mui/icons-material/Settings';
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

  const [optionsDialogVisible, setOptionsDialogVisible] = useState(false);
  const [crawlDialogVisible, setCrawlDialogVisible] = useState(false);

  const [manualLaunchDialogVisible, setManualLaunchDialogVisible] = useState<{
    visible: boolean;
    port: number;
  } | null>(null);

  const { activeSpace, setActiveSpace, spaces, addSpace, removeSpace, importSpace } = useSpaces();

  const {
    startService,
    disableService,
    enabled: resolvedServiceEnabled,
    settings: spaceSettings,
    toggleSettings,
  } = useService(activeSpace?.name);

  const startBrowser = async (ignoreSSLError = false): Promise<void> => {
    if (!activeSpace) return;
    const launchResult = await window.api.startBrowser(activeSpace.name, ignoreSSLError);
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

  const handleInstallCertificeAgree = async (): Promise<void> => {
    setInstallCertificateConfirmationDialogVisible(false);
    await window.api.installCertificate();
    await startBrowser(false);
  };

  const handleSpaceChange = (spaceName: string): void => {
    const newActiveSpace = spaces.find((space) => space.name === spaceName);
    if (!newActiveSpace) return;
    setActiveSpace(newActiveSpace);
  };

  const handleAddSpace = async (newSpace: Space): Promise<void> => {
    if (spaces.some((space) => space.name === newSpace.name)) {
      return;
    }
    await addSpace(newSpace);
    await setActiveSpace(newSpace);
  };

  return (
    <>
      <Box>
        <SpaceManager
          activeSpace={activeSpace}
          onSpaceChange={handleSpaceChange}
          availableSpaces={spaces}
          onSpaceAdd={handleAddSpace}
          onSpaceRemove={(space) => removeSpace(space)}
          onImportSpace={() => importSpace()}
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
        <ButtonGroup variant="contained">
          <Button
            variant="contained"
            color={resolvedServiceEnabled ? 'error' : 'primary'}
            startIcon={<TravelExploreIcon />}
            onClick={() => {
              handleAsyncAction(async () => {
                if (resolvedServiceEnabled) {
                  await disableService();
                } else {
                  const proxyInstance = await startService();
                  if (spaceSettings.customBrowser) {
                    setManualLaunchDialogVisible({
                      visible: true,
                      port: proxyInstance.port,
                    });
                  } else {
                    await startBrowser();
                  }
                }
              });
            }}
          >
            {resolvedServiceEnabled ? t('stop') : t('browse')}
          </Button>
          {manualLaunchDialogVisible && (
            <ManualLaunchDialog
              port={manualLaunchDialogVisible.port}
              onClose={() => setManualLaunchDialogVisible(null)}
            />
          )}
          <Button
            color="info"
            title={t('settings')}
            onClick={() => {
              console.debug('spaceSettings', spaceSettings);
              setOptionsDialogVisible(true);
            }}
          >
            <SettingsIcon />
          </Button>
          {activeSpace && (
            <SettingsDialog
              open={optionsDialogVisible}
              onClose={() => setOptionsDialogVisible(false)}
              settings={spaceSettings}
              toggleSettings={toggleSettings}
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
          {activeSpace && (
            <CrawlDialog
              open={crawlDialogVisible}
              onClose={() => setCrawlDialogVisible(false)}
              onOk={async (startUrl) => {
                if (resolvedServiceEnabled) {
                  await startService();
                }
                await window.api.runCrawler(activeSpace.name, startUrl, {});
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
              onClick={() => handleAsyncAction(() => handleInstallCertificeAgree())}
              autoFocus
            >
              {t('agree')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}

export default Main;
