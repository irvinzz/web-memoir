import { useState } from 'react';

import CloudOffIcon from '@mui/icons-material/CloudOff';
import SettingsIcon from '@mui/icons-material/Settings';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import InfoIcon from '@mui/icons-material/Info';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  AppBar,
  Tabs,
  Tab,
  Box,
  CssBaseline} from '@mui/material'
import Main from './components/Main';
import { LoadingProvider, LoadingMask } from './hooks/handle-async-action';
import { ServiceProvider } from './hooks/use-service';
import Options from './components/Options';
import Tools from './components/Tools';
import About from './components/About';

function TabPanel(props: { children?: React.ReactNode; index: number; value: number; }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App(): React.JSX.Element {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <>
      <ThemeProvider theme={theme}>
        <LoadingProvider>
          <ServiceProvider>
          <CssBaseline />
          <LoadingMask />
          <AppBar position="static">
            <Tabs value={tabIndex} onChange={handleTabChange}>
              <Tab
                label="Main"
                icon={<CloudOffIcon />}
                iconPosition='start'
              />
              <Tab
                label="Options"
                icon={<SettingsIcon />}
                iconPosition='start'
              />
              <Tab
                label="Tools"
                icon={<ManageHistoryIcon />}
                iconPosition='start'
              />
              <Tab
                label="About"
                icon={<InfoIcon />}
                iconPosition='start'
              />
            </Tabs>
          </AppBar>
          <TabPanel value={tabIndex} index={0}>
            <Main />
          </TabPanel>
            <TabPanel value={tabIndex} index={1}>
              <Options />
            </TabPanel>
            <TabPanel value={tabIndex} index={2}>
              <Tools />
            </TabPanel>
            <TabPanel value={tabIndex} index={3}>
              <About />
            </TabPanel>
          </ServiceProvider>
        </LoadingProvider>
      </ThemeProvider>
    </>
  )
}

export default App
