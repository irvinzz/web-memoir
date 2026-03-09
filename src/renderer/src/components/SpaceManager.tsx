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
import { Space } from '@shared';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
    if (!newSpaceName.trim()) {
      setError('Space name cannot be empty');
      return;
    }

    onSpaceAdd({ name: newSpaceName });
    onSpaceChange(newSpaceName);
    handleCloseDialog();
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
            Space:
          </Typography>
          <Button variant="outlined" size="small" onClick={handleOpenDialog}>
            {activeSpace?.name}
          </Button>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Select or Create Space</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search spaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Typography variant="h6" sx={{ mb: 1 }}>
              Available Spaces
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filteredSpaces.length > 0 ? (
                filteredSpaces.map((space) => (
                  <Button
                    key={space.name}
                    variant={space === space ? 'contained' : 'outlined'}
                    onClick={() => handleSpaceSelect(space)}
                  >
                    {space.name}
                  </Button>
                ))
              ) : (
                <Typography
                  variant="body2"
                  sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}
                >
                  No spaces found
                </Typography>
              )}
            </Box>

            <Box sx={{ pt: 2, borderTop: '1px solid #ccc' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Create New Space
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter space name"
                  value={newSpaceName}
                  onChange={(e) => {
                    setNewSpaceName(e.target.value);
                    if (error) setError('');
                  }}
                  error={!!error}
                  helperText={error || 'Enter a unique name for the new space'}
                />
                <Button
                  variant="contained"
                  onClick={handleAddSpace}
                  startIcon={<Add />}
                  disabled={!newSpaceName.trim()}
                >
                  Add
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SpaceManager;
