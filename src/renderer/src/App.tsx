import { useState } from 'react';

import CloudOffIcon from '@mui/icons-material/CloudOff';
import InfoIcon from '@mui/icons-material/Info';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Tabs, Tab, Box, CssBaseline } from '@mui/material';

import Main from './components/Main/Main';
import About from './components/About';
import { useTranslation } from './localization/hook';
import { GlobalDialogsProvider } from './lib/global-dialog';
import { LoadingProvider } from './lib/async-handler';

function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}): React.JSX.Element {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3, width: '100%' }}>{children}</Box>}
    </div>
  );
}

function App(): React.JSX.Element {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number): void => {
    setTabIndex(newValue);
  };

  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <LoadingProvider>
        <GlobalDialogsProvider>
          <CssBaseline />
          <AppBar position="static">
            <Tabs value={tabIndex} onChange={handleTabChange}>
              <Tab label={t('main')} icon={<CloudOffIcon />} iconPosition="start" />
              <Tab label={t('about')} icon={<InfoIcon />} iconPosition="start" />
            </Tabs>
          </AppBar>
          <TabPanel value={tabIndex} index={0}>
            <Main />
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <About />
          </TabPanel>
        </GlobalDialogsProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;
