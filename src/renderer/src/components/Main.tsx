import { useRef, useState } from "react";
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
} from "@mui/material";

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import { useService } from "@renderer/hooks/use-service";
import { useHandleAsyncAction } from "@renderer/hooks/handle-async-action";

function Main(): React.JSX.Element {
  const { handleAsyncAction } = useHandleAsyncAction();
  const [
    installCertificateConfirmationDialogVisible,
    setInstallCertificateConfirmationDialogVisible,
  ] = useState<boolean>(false);

  const [
    manualLaunchDialogVisible,
    setManualLaunchDialogVisible,
  ] = useState<{ visible: boolean; port: number } | null>(null);

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
    describeInstance,
  } = useService();

  const proxyRef = useRef<HTMLInputElement>(null);
  const handleCopy = () => {
    const value = proxyRef.current?.value ?? '';
    window.api.putToClipboard(value);
  };

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
            resolvedServiceEnabled ? disableService('default') : enableService('default');
          }}
        />}
        label={resolvedServiceEnabled ? 'Service started' : 'Service stopped'}
      />
      <FormControlLabel
        control={<Switch
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
        <Button
          color="info"
          disabled={!resolvedServiceEnabled}
        >
          <SettingsIcon
            onClick={() => {
              handleAsyncAction(async () => {
                const result = await describeInstance('default');
                setManualLaunchDialogVisible({
                  visible: true,
                  port: result.port,
                });
              });
            }}
          />
        </Button>
      </ButtonGroup>


      <Dialog
        open={manualLaunchDialogVisible?.visible || false}
      >
        <DialogTitle></DialogTitle>
        <DialogContent>
          <Box sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Typography variant="body1" fontWeight="medium">
                  Step 1. Install Certificate
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
                  Browse Certificate
                </Button>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="body1" fontWeight="medium">
                  Step 2. Set HTTPS Proxy
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
                          <IconButton
                            edge="end"
                            aria-label="copy proxy"
                            onClick={handleCopy}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </Stack>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setManualLaunchDialogVisible(null) }}>
            Close
          </Button>
        </DialogActions>

      </Dialog>

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
