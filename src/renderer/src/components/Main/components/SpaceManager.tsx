import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  InputAdornment,
  ButtonGroup,
} from '@mui/material';
import {
  WorkspacesOutline,
  Add,
  Search,
  SaveAltTwoTone,
  UploadFileTwoTone,
  DeleteForeverOutlined,
} from '@mui/icons-material';
import { isValidSpaceName, Space, SpaceSettings } from '@shared';
import { useTranslation } from '@renderer/localization/hook';
import { useHandleAsyncAction } from '@renderer/hooks/handle-async-action';

import SettingsIcon from '@mui/icons-material/Settings';

import SettingsDialog from './Settings';

interface SpaceManagerProps {
  activeSpaceName: string | undefined;
  onSpaceChange: (spaceName: string) => void;
  availableSpaces: Record<string, Space>;
  onSpaceAdd: (spaceName: string, newSpace: Space) => Promise<void>;
  onSpaceRemove: (spaceName: string) => Promise<void>;
  onImportSpace: () => Promise<void>;
  toggleSettings: (spaceName: string, newSettings: SpaceSettings) => Promise<void>;
}

function SpaceManager({
  activeSpaceName,
  onSpaceChange,
  availableSpaces,
  onSpaceAdd,
  onSpaceRemove,
  onImportSpace,
  toggleSettings,
}: SpaceManagerProps): React.JSX.Element {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { handleAsyncAction, confirm } = useHandleAsyncAction();

  const handleOpenDialog = (): void => {
    setDialogOpen(true);
    setNewSpaceName('');
    setError('');
    setSearchTerm('');
  };

  const handleCloseDialog = (): void => {
    setDialogOpen(false);
    setNewSpaceName('');
    setError('');
    setSearchTerm('');
  };

  const handleSpaceSelect = (spaceName: string): void => {
    onSpaceChange(spaceName);
    handleCloseDialog();
  };

  const handleAddSpace = (): void => {
    handleAsyncAction(async () => {
      if (!isValidSpaceName(newSpaceName)) {
        setError('only chars, numbers and dash allowed');
        return;
      }

      await onSpaceAdd(newSpaceName, { settings: {} });
      handleCloseDialog();
    });
  };

  const visibleSpaces = useMemo((): Array<Space & { name: string }> => {
    return Object.entries(availableSpaces)
      .map(([name, space]) => {
        return { ...space, name };
      })
      .filter((space) => {
        if (!searchTerm) return true;
        return space.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [availableSpaces, searchTerm]);

  const onExportSpace = (spaceName: string): void => {
    handleAsyncAction(async () => {
      await window.api.exportSpace(spaceName);
    });
  };

  const [optionsDialogVisible, setOptionsDialogVisible] = useState(false);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
          p: 1,
          paddingBottom: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <WorkspacesOutline sx={{ color: 'primary.main' }} />
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            {t('space')}:
          </Typography>
          <ButtonGroup>
            <Button variant="outlined" color="warning" size="small" onClick={handleOpenDialog}>
              {activeSpaceName}
            </Button>
            <Button
              color="info"
              variant="outlined" 
              size="small"
              title={t('settings')}
              onClick={() => {
                setOptionsDialogVisible(true);
              }}
            >
              <SettingsIcon />
            </Button>

          </ButtonGroup>
          {activeSpaceName && (
            <SettingsDialog
              open={optionsDialogVisible}
              onClose={() => setOptionsDialogVisible(false)}
              settings={availableSpaces[activeSpaceName]?.settings}
              toggleSettings={(newSettings) => toggleSettings(activeSpaceName, newSettings)}
            />
          )}
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('selectOrCreateSpace')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder={t('searchSpaces')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Typography sx={{ mb: 0 }}>{t('availableSpaces')}:</Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {visibleSpaces.length > 0 ? (
                visibleSpaces.map((space) => (
                  <>
                    <ButtonGroup fullWidth>
                      <Button
                        sx={{ flex: 8 }}
                        key={space.name}
                        size="small"
                        variant={space.name === activeSpaceName ? 'contained' : 'outlined'}
                        onClick={() => handleSpaceSelect(space.name)}
                      >
                        {space.name}
                      </Button>
                      <Button
                        sx={{ flex: 1 }}
                        size="small"
                        onClick={() => onExportSpace(space.name)}
                        disabled={space.settings?.private}
                        title={t('exportSpace')}
                      >
                        <SaveAltTwoTone />
                      </Button>
                      <Button
                        sx={{ flex: 1 }}
                        size="small"
                        title={t('deleteSpace')}
                        onClick={() => {
                          handleAsyncAction(async () => {
                            const answer = await confirm();
                            if (answer === 'NO') {
                              return;
                            } else if (answer === 'YES') {
                              await onSpaceRemove(space.name);
                            } else {
                              throw new Error(`Invalid answer ${answer}`);
                            }
                          });
                        }}
                      >
                        <DeleteForeverOutlined />
                      </Button>
                    </ButtonGroup>
                  </>
                ))
              ) : (
                <Typography
                  variant="body2"
                  sx={{ textAlign: 'center', py: 1, color: 'text.secondary' }}
                >
                  {t('noSpacesFound')}
                </Typography>
              )}
            </Box>

            <Box sx={{ pt: 1, gap: 2, borderTop: '1px solid #ccc' }}>
              <Typography sx={{ mb: 0 }}>{t('createNewSpace')}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder={t('enterUniqueName')}
                  value={newSpaceName}
                  onChange={(e) => {
                    setNewSpaceName(e.target.value);
                    if (error) setError('');
                  }}
                  error={!!error}
                  helperText={error}
                />
                <Button
                  variant="contained"
                  onClick={handleAddSpace}
                  startIcon={<Add />}
                  disabled={!newSpaceName.trim()}
                >
                  {t('add')}
                </Button>
              </Box>
            </Box>
            <Box sx={{ pt: 1, gap: 2, borderTop: '1px solid #ccc' }}>
              <Typography sx={{ mb: 0 }}>{t('importNewSpace')}</Typography>
              <Box sx={{ display: 'flex' }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<UploadFileTwoTone />}
                  onClick={() =>
                    handleAsyncAction(async () => {
                      await onImportSpace();
                    })
                  }
                >
                  {t('importNewSpace')}
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('close')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SpaceManager;
