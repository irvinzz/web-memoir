import { useState } from 'react';

import CloudOffIcon from '@mui/icons-material/CloudOff';
import SettingsIcon from '@mui/icons-material/Settings';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import InfoIcon from '@mui/icons-material/Info';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Tabs, Tab, Box, CssBaseline } from '@mui/material';

import { Space } from '@shared';

import Main from './components/Main';
import { LoadingProvider, LoadingMask } from './hooks/handle-async-action';
import Options from './components/Options';
import Tools from './components/Tools';
import About from './components/About';
import SpaceManager from './components/SpaceManager';
import { useSpaces } from './hooks/use-spaces';
import { useTranslation } from './localization/hook';

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
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);

  const { activeSpace, setActiveSpace, spaces, addSpace, removeSpace, importSpace } = useSpaces();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number): void => {
    setTabIndex(newValue);
  };

  const handleSpaceChange = (spaceName: string): void => {
    const newActiveSpace = spaces.find((space) => space.name === spaceName);
    if (!newActiveSpace) return;
    setActiveSpace(newActiveSpace);
  };

  const handleAddSpace = async (newSpace: Space): Promise<void> => {
    if (spaces.some((space) => space.name === newSpace.name)) {
      return;
    }
    await addSpace(newSpace);
    await setActiveSpace(newSpace);
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
            <SpaceManager
              activeSpace={activeSpace}
              onSpaceChange={handleSpaceChange}
              availableSpaces={spaces}
              onSpaceAdd={handleAddSpace}
              onSpaceRemove={(space) => removeSpace(space)}
              onImportSpace={() => importSpace()}
            />
            <Tabs value={tabIndex} onChange={handleTabChange}>
              <Tab label="Main" icon={<CloudOffIcon />} iconPosition="start" />
              <Tab label="Options" icon={<SettingsIcon />} iconPosition="start" />
              <Tab label="Tools" icon={<ManageHistoryIcon />} iconPosition="start" />
              <Tab label="About" icon={<InfoIcon />} iconPosition="start" />
            </Tabs>
          </AppBar>
          {activeSpace && (
            <>
              <TabPanel value={tabIndex} index={0}>
                <Main space={activeSpace} />
              </TabPanel>
              <TabPanel value={tabIndex} index={1}>
                <Options space={activeSpace} />
              </TabPanel>
              <TabPanel value={tabIndex} index={2}>
                <Tools space={activeSpace} />
              </TabPanel>
              <TabPanel value={tabIndex} index={3}>
                <About />
              </TabPanel>
            </>
          )}
        </LoadingProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
