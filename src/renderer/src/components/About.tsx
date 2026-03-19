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
            This application allows you to memorize and later reproduce your web interactions.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Common use cases include:
          </Typography>
          <List dense>
            <ListItem disableGutters>
              <ListItemText primary="Internet issues" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Internet restrictions" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Website down" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Website discontinued" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText primary="Website state in the past" />
            </ListItem>
          </List>
        </div>
      </Typography>
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

