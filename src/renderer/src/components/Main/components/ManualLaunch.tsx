import { useRef } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  DialogActions,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { useTranslation } from '@renderer/localization/hook';
import { useHandleAsyncAction } from '@renderer/hooks/handle-async-action';

export function ManualLaunchDialog(props: {
  onClose: () => void;
  port: number;
}): React.JSX.Element {
  const { onClose, port } = props;

  const { t } = useTranslation();

  const { handleAsyncAction } = useHandleAsyncAction();

  const proxyRef = useRef<HTMLInputElement>(null);
  const handleCopy = (): void => {
    const value = proxyRef.current?.value ?? '';
    window.api.putToClipboard(value);
  };

  return (
    <Dialog open>
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
                value={`https://localhost:${port}`}
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
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
}
