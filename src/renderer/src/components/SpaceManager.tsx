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
} from '@mui/material';
import { Cloud, Add, Search } from '@mui/icons-material';
import { isValidSpaceName, Space } from '@shared';
import { useTranslation } from '@renderer/localization/hook';
import { useHandleAsyncAction } from '@renderer/hooks/handle-async-action';

interface SpaceManagerProps {
  activeSpace: Space | undefined;
  onSpaceChange: (spaceName: string) => void;
  availableSpaces: Space[];
  onSpaceAdd: (newSpace: Space) => Promise<void>;
}

function SpaceManager({
  activeSpace,
  onSpaceChange,
  availableSpaces,
  onSpaceAdd,
}: SpaceManagerProps): React.JSX.Element {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { handleAsyncAction } = useHandleAsyncAction();

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

  const handleSpaceSelect = (space: Space): void => {
    onSpaceChange(space.name);
    handleCloseDialog();
  };

  const handleAddSpace = (): void => {
    handleAsyncAction(async () => {
      if (!isValidSpaceName(newSpaceName)) {
        setError('only chars, numbers and dash allowed');
        return;
      }

      await onSpaceAdd({ name: newSpaceName });
      handleCloseDialog();
    });
  };

  const filteredSpaces = useMemo(() => {
    if (!searchTerm) return availableSpaces;
    return availableSpaces.filter((space) =>
      space.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableSpaces, searchTerm]);

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
          <Cloud sx={{ color: 'primary.main' }} />
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            {t('space')}:
          </Typography>
          <Button variant="outlined" size="small" onClick={handleOpenDialog}>
            {activeSpace?.name}
          </Button>
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
              {filteredSpaces.length > 0 ? (
                filteredSpaces.map((space) => (
                  <Button
                    key={space.name}
                    size="small"
                    variant={space === space ? 'contained' : 'outlined'}
                    onClick={() => handleSpaceSelect(space)}
                  >
                    {space.name}
                  </Button>
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

            <Box sx={{ pt: 1, borderTop: '1px solid #ccc' }}>
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
