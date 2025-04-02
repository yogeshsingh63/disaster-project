import { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Alert
} from '@mui/material';
import AuthContext from '../../context/AuthContext';

export default function VerificationPending() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Verification Pending
          </Typography>
          
          <Alert severity="info" sx={{ width: '100%', my: 2 }}>
            Your account is awaiting verification by an administrator.
          </Alert>
          
          <Typography variant="body1" align="center" paragraph>
            Thank you for registering as a {user?.role} on our Disaster Relief Platform.
            Before you can access the platform, your account needs to be verified by an administrator.
          </Typography>
          
          <Typography variant="body1" align="center" paragraph>
            This process usually takes 24-48 hours. You will receive an email notification
            once your account has been verified.
          </Typography>
          
          <Typography variant="body1" align="center" paragraph>
            If you have any questions or need immediate assistance, please contact our support team.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            onClick={logout}
            sx={{ mt: 2 }}
          >
            Logout
          </Button>
          
          <Link to="/login" style={{ textDecoration: 'none', marginTop: '16px' }}>
            <Typography variant="body2" color="primary">
              Back to Login
            </Typography>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}
