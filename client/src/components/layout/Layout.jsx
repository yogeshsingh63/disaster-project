import { useContext, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Button,
  Avatar,
  Menu,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import InventoryIcon from '@mui/icons-material/Inventory';
import HelpIcon from '@mui/icons-material/Help';
import MapIcon from '@mui/icons-material/Map';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AuthContext from '../../context/AuthContext';
import SocketContext from '../../context/SocketContext';

const drawerWidth = 240;
const collapsedDrawerWidth = 70;

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const { alerts, clearAlert } = useContext(SocketContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };
  
  const handleAlertClose = (id) => {
    clearAlert(id);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Navigation items based on user role
  const getNavItems = () => {
    const items = [
      { 
        text: 'Dashboard', 
        icon: <DashboardIcon />, 
        path: `/${user?.role?.toLowerCase()}` 
      }
    ];
    
    if (user?.role === 'Admin') {
      items.push(
        { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
        { text: 'Disasters', icon: <WarningIcon />, path: '/admin/disasters' },
        { text: 'Resources', icon: <InventoryIcon />, path: '/admin/resources' },
        { text: 'Help Requests', icon: <HelpIcon />, path: '/admin/help-requests' },
        { text: 'Map', icon: <MapIcon />, path: '/admin/map' }
      );
    } else if (user?.role === 'NGO') {
      items.push(
        { text: 'Resources', icon: <InventoryIcon />, path: '/ngo/resources' },
        { text: 'Volunteers', icon: <PeopleIcon />, path: '/ngo/volunteers' },
        { text: 'Help Requests', icon: <HelpIcon />, path: '/ngo/help-requests' },
        { text: 'Map', icon: <MapIcon />, path: '/ngo/map' }
      );
    } else if (user?.role === 'Volunteer') {
      items.push(
        { text: 'Assignments', icon: <InventoryIcon />, path: '/volunteer/assignments' },
        { text: 'Map', icon: <MapIcon />, path: '/volunteer/map' }
      );
    } else if (user?.role === 'AffectedIndividual') {
      items.push(
        { text: 'Request Help', icon: <HelpIcon />, path: '/affected/request-help' },
        { text: 'My Requests', icon: <InventoryIcon />, path: '/affected/my-requests' },
        { text: 'Nearby Resources', icon: <MapIcon />, path: '/affected/resources' }
      );
    }
    
    return items;
  };
  
  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        minHeight: '64px !important'
      }}>
        {!sidebarCollapsed && (
          <Typography variant="h6" noWrap component="div">
            Disaster Relief
          </Typography>
        )}
        <IconButton onClick={toggleSidebarCollapse}>
          {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {getNavItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              sx={{ 
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                py: 1.5
              }}
            >
              <ListItemIcon sx={{ minWidth: sidebarCollapsed ? 0 : 40, mr: sidebarCollapsed ? 0 : 2 }}>
                {item.icon}
              </ListItemIcon>
              {!sidebarCollapsed && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const currentDrawerWidth = sidebarCollapsed ? collapsedDrawerWidth : drawerWidth;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { sm: `${currentDrawerWidth}px` },
          transition: theme => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.role} Dashboard
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar alt={user?.name} src={user?.profilePicture} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ 
          width: { sm: currentDrawerWidth }, 
          flexShrink: { sm: 0 },
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: currentDrawerWidth,
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          transition: theme => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
      
      {/* Disaster alerts */}
      {alerts.map((alert, index) => (
        <Snackbar 
          key={alert.id || index}
          open={true} 
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ top: `${(index * 80) + 10}px` }}
        >
          <Alert 
            onClose={() => handleAlertClose(alert.id)} 
            severity="warning" 
            sx={{ width: '100%' }}
          >
            <Typography variant="subtitle1">{alert.title}</Typography>
            <Typography variant="body2">{alert.message}</Typography>
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
}
