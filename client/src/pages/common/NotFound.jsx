import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  Paper
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function NotFound() {
  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography component="h1" variant="h4" gutterBottom>
            404 - Page Not Found
          </Typography>
          <Typography variant="body1" paragraph>
            The page you are looking for doesn't exist or has been moved.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Go to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
