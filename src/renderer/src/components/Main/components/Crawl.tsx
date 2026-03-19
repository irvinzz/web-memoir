import { useState } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';

import { useHandleAsyncAction } from '@renderer/hooks/handle-async-action';
import { useTranslation } from '@renderer/localization/hook';

export function CrawlDialog(props: {
  open: boolean;
  onClose: () => void;
  onOk: (startUrl: string) => Promise<void>;
}): React.JSX.Element {
  const { open, onClose, onOk } = props;
  const { t } = useTranslation();
  const { handleAsyncAction } = useHandleAsyncAction();

  const [startUrlError, setStartUrlError] = useState<string>();

  const [startUrl, setStartUrl] = useState('');
  const onCrawlOk = (): void => {
    handleAsyncAction(async () => {
      const parsedUrl = URL.parse(startUrl);
      if (!parsedUrl || !['http:', 'https:'].includes(parsedUrl.protocol)) {
        setStartUrlError(t('invalidUrl'));
        return;
      }
      setStartUrlError(undefined);
      await onOk(startUrl);
      onClose();
    });
  };

  return (
    <Dialog open={open}>
      <DialogTitle>{t('crawler')}</DialogTitle>
      <DialogContent>
        <DialogContentText>Please provide start URL</DialogContentText>
        <TextField
          error={Boolean(startUrlError)}
          helperText={startUrlError}
          placeholder="https://example.org"
          value={startUrl}
          onChange={(e) => {
            setStartUrlError(undefined);
            setStartUrl(e.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCrawlOk}>{t('ok')}</Button>
        <Button onClick={onClose}>{t('cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
}
