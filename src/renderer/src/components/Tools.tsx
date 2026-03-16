import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { Space } from '@shared';
import { useHandleAsyncAction } from '@renderer/hooks/handle-async-action';
import { useTranslation } from '@renderer/localization/hook';
import { useState } from 'react';

function Tools(props: { space: Space }): React.JSX.Element {
  const { space } = props;
  const { t } = useTranslation();
  const { handleAsyncAction } = useHandleAsyncAction();

  const [crawlDialogVisible, setCrawlDialogVisible] = useState(false);

  const [startUrl, setStartUrl] = useState('');
  const [startUrlError, setStartUrlError] = useState<string>();

  const onCrawlOk = (): void => {
    handleAsyncAction(async () => {
      const parsedUrl = URL.parse(startUrl);
      if (!parsedUrl || !['http:', 'https:'].includes(parsedUrl.protocol)) {
        setStartUrlError(t('invalidUrl'));
        return;
      }
      setStartUrlError(undefined);
      setCrawlDialogVisible(false);
      await window.api.runCrawler(space.name, startUrl, {});
    });
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => {
          setCrawlDialogVisible(true);
        }}
      >
        {t('crawl')}
      </Button>
      <Button
        variant="outlined"
        onClick={() => {
          handleAsyncAction(async () => {
            await window.api.exportSpace(space.name);
          });
        }}
      >
        Export space
      </Button>
      <Button
        variant="outlined"
        onClick={() => {
          handleAsyncAction(async () => {
            await window.api.importSpace(space.name);
          });
        }}
      >
        Import space
      </Button>
      <Dialog open={crawlDialogVisible}>
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
          <Button
            onClick={() => {
              setCrawlDialogVisible(false);
            }}
          >
            {t('cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Tools;
