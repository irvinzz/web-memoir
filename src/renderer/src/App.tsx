import { useState } from 'react';

import CloudOffIcon from '@mui/icons-material/CloudOff';
import SettingsIcon from '@mui/icons-material/Settings';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import InfoIcon from '@mui/icons-material/Info';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Tabs, Tab, Box, CssBaseline } from '@mui/material';
import Main from './components/Main';
import { LoadingProvider, LoadingMask } from './hooks/handle-async-action';
import Options from './components/Options';
import Tools from './components/Tools';
import About from './components/About';
import SpaceManager from './components/SpaceManager';

function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}): React.JSX.Element {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App(): React.JSX.Element {
  const [tabIndex, setTabIndex] = useState(0);
  const [currentSpace, setCurrentSpace] = useState('default');
  const availableSpaces = ['default', 'development', 'staging', 'production'];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number): void => {
    setTabIndex(newValue);
  };

  const handleSpaceChange = (space: string): void => {
    setCurrentSpace(space);
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
          <CssBaseline />
          <LoadingMask />
          <AppBar position="static">
            <Box
              sx={{
                p: 1,
              }}
            >
              <SpaceManager
                space={currentSpace}
                onSpaceChange={handleSpaceChange}
                availableSpaces={availableSpaces}
              />
            </Box>
            <Tabs value={tabIndex} onChange={handleTabChange}>
              <Tab label="Main" icon={<CloudOffIcon />} iconPosition="start" />
              <Tab label="Options" icon={<SettingsIcon />} iconPosition="start" />
              <Tab label="Tools" icon={<ManageHistoryIcon />} iconPosition="start" />
              <Tab label="About" icon={<InfoIcon />} iconPosition="start" />
            </Tabs>
          </AppBar>
          <TabPanel value={tabIndex} index={0}>
            <Main space={currentSpace} />
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <Options space={currentSpace} />
          </TabPanel>
          <TabPanel value={tabIndex} index={2}>
            <Tools space={currentSpace} />
          </TabPanel>
          <TabPanel value={tabIndex} index={3}>
            <About />
          </TabPanel>
        </LoadingProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
