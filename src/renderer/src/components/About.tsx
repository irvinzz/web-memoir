import { Typography, List, ListItem, ListItemText } from '@mui/material';
import { useHandleAsyncAction } from '@renderer/hooks/handle-async-action';
import { useTranslation } from '@renderer/localization/hook';

function About(): React.JSX.Element {
  const { t } = useTranslation();

  const { handleAsyncAction } = useHandleAsyncAction();

  return (
    <>
      <Typography variant="h4" sx={{ display: 'flex', justifyContent: 'center' }}>
        {t('webMemoir')}
      </Typography>
      <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'center' }}>
        <div>
          <Typography variant="h6" gutterBottom>
            {t('aboutApplication')}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {t('commonUseCases')}
          </Typography>
          <List dense>
            <ListItem disableGutters>
              <ListItemText primary={t('internetIssues')} />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary={t('internetRestrictions')} />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary={t('websiteDown')} />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary={t('websiteDiscontinued')} />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary={t('websiteStateInPast')} />
            </ListItem>
          </List>
        </div>
      </Typography>

      {/*
      <ul className="versions">
        <li className="electron-version">Electron v{versions.electron}</li>
        <li className="chrome-version">Chromium v{versions.chrome}</li>
        <li className="node-version">Node v{versions.node}</li>
      </ul>
      */}
      {/*
      <Button
        onClick={() => {
          handleAsyncAction(async () => {
            const inspection = await window.api.inspect();
            console.debug(inspection);
            alert(JSON.stringify(inspection, null, 2));
          });
        }}
      >
        Debug
      </Button>
      */}
    </>
  );
}

export default About;
