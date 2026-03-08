import { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { CloudSync } from '@mui/icons-material';

interface SpaceManagerProps {
  space: string;
  onSpaceChange: (space: string) => void;
  availableSpaces: string[];
}

function SpaceManager({
  space,
  onSpaceChange,
  availableSpaces,
}: SpaceManagerProps): React.JSX.Element {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = (): void => {
    setDialogOpen(true);
  };

  const handleCloseDialog = (): void => {
    setDialogOpen(false);
  };

  const handleSpaceSelect = (space: string): void => {
    onSpaceChange(space);
    handleCloseDialog();
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
        Space:
      </Typography>
      <ButtonGroup>
        <Button>
          <Typography>{space}</Typography>
        </Button>
        <Button variant="outlined" size="small" onClick={handleOpenDialog}>
          <CloudSync sx={{ color: 'primary.main' }} />
        </Button>
      </ButtonGroup>
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Select Space</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            {availableSpaces.map((space) => (
              <Button
                key={space}
                variant={space === space ? 'contained' : 'outlined'}
                onClick={() => handleSpaceSelect(space)}
              >
                {space}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SpaceManager;
