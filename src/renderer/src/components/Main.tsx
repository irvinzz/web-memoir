import { useState } from "react";
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
  Switch,
} from "@mui/material";

import SettingsIcon from '@mui/icons-material/Settings';
import { useService } from "@renderer/hooks/use-service";

function Main(): React.JSX.Element {
  const [
    installCertificateConfirmationDialogVisible,
    setInstallCertificateConfirmationDialogVisible,
  ] = useState<boolean>(false);

  const startBrowser = async (ignoreSSLError = false) => {
    const launchResult = await window.api.startBrowser('default', ignoreSSLError);
    if (launchResult.code === 'CERT_NOT_INSTALLED') {
      setInstallCertificateConfirmationDialogVisible(true);
    }
  }

  const handleInstallCertificateCancel = () => {
    setInstallCertificateConfirmationDialogVisible(false);
  }

  const handleInstallCertificateIgnore = () => {
    setInstallCertificateConfirmationDialogVisible(false);
    startBrowser(true);
  };

  const handleInstallCertificeAgree = async () => {
    setInstallCertificateConfirmationDialogVisible(false);
    await window.api.installCertificate();
    await startBrowser(false);
  }

  const {
    enableService,
    disableService,
    enabled: resolvedServiceEnabled,
    options,
    toggleOption,
  } = useService();

  return (

    <Box sx={{
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '80vh',
      flexDirection: 'column',
    }}>
      <FormControlLabel
        control={<Switch
          checked={resolvedServiceEnabled}
          color={resolvedServiceEnabled ? 'success' : 'error'}
          onChange={() => {
            resolvedServiceEnabled ? disableService() : enableService();
          }}
        />}
        label={resolvedServiceEnabled ? 'Service started' : 'Service stopped'}
      />
      <FormControlLabel
        control={<Switch
          disabled={!resolvedServiceEnabled}
          checked={options.offline}
          color={options.offline ? 'error' : 'default'}
          onChange={(e) => {
            toggleOption({ offline: e.target.checked })
          }}
        />}
        label={options.offline ? 'Offline Mode enabled' : 'Offline Mode disabled'}
      />
        <ButtonGroup variant='contained'>
          <Button
            variant='contained'
            color='info'
            disabled={!resolvedServiceEnabled}
            onClick={(event) => {
              startBrowser();
            }}
          >
            Launch Browser
        </Button>
        <Button color="info">
          <SettingsIcon
            onClick={() => {
          }}
          />
        </Button>
      </ButtonGroup>
      <Dialog
        open={installCertificateConfirmationDialogVisible}
        onClose={() => {
          //
        }}
      >
        <DialogTitle>
          Certificate missing
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Let's install application ssl certificate to your browser.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInstallCertificateCancel}>
            Cancel
          </Button>
          <Button onClick={handleInstallCertificeAgree} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Main;
