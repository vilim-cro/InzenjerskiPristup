import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';


function ResponsiveAppBar({ username,
                            groups,
                            setShowScanNewDocument,
                            setShowScanHistory,
                            setShowArrivedDocuments,
                            setShowAddNewEmployee}) {

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            DIGITALIZACIJA
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              <MenuItem key="ScanNewDocument" onClick={() => {
                handleCloseNavMenu()
                setShowScanNewDocument(true)
                setShowScanHistory(false)
                setShowArrivedDocuments(false)
                setShowAddNewEmployee(false)
              }}>
                <Typography textAlign="center">Skeniraj novi dokument</Typography>
              </MenuItem>
              <MenuItem key="ShowScanHistory" onClick={() => {
                handleCloseNavMenu()
                setShowScanNewDocument(false)
                setShowScanHistory(true)
                setShowArrivedDocuments(false)
                setShowAddNewEmployee(false)
              }}>
                <Typography textAlign="center">Povijest skeniranja</Typography>
              </MenuItem>
              {
                (groups.filter((group) => group==="Direktori" || group==="Revizori" || group==="Računovođe").length > 0) && (
                  <MenuItem key="ArrivedDocuments" onClick={() => {
                    handleCloseNavMenu()
                    setShowScanNewDocument(false)
                    setShowScanHistory(false)
                    setShowArrivedDocuments(true)
                    setShowAddNewEmployee(false)
                  }}>
                    <Typography textAlign="center">Pristigli dokumenti</Typography>
                  </MenuItem>
                )
              }
              {
                (groups.includes("Direktori")) && (
                  <MenuItem key="AddNewEmployee" onClick={() => {
                    handleCloseNavMenu()
                    setShowScanNewDocument(false)
                    setShowScanHistory(false)
                    setShowArrivedDocuments(false)
                    setShowAddNewEmployee(true)
                  }}>
                    <Typography textAlign="center">Dodaj novog zaposlenika</Typography>
                  </MenuItem>
                )
              }
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            DIGITALIZACIJA
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              key="ScanNewDocument"
              onClick={() => {
                handleCloseNavMenu()
                setShowScanNewDocument(true)
                setShowScanHistory(false)
                setShowArrivedDocuments(false)
                setShowAddNewEmployee(false)
              }}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Skeniraj novi dokument
            </Button>
            <Button
              key="ScanHistory"
              onClick={() => {
                handleCloseNavMenu()
                setShowScanNewDocument(false)
                setShowScanHistory(true)
                setShowArrivedDocuments(false)
                setShowAddNewEmployee(false)
              }}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Povijest skeniranja
            </Button>
            {(groups.filter((group) => group==="Direktori" || group==="Revizori" || group==="Računovođe").length > 0) && (<Button
              key="ArrivedDocuments"
              onClick={() => {
                handleCloseNavMenu()
                setShowScanNewDocument(false)
                setShowScanHistory(false)
                setShowArrivedDocuments(true)
                setShowAddNewEmployee(false)
              }}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Pristigli dokumenti
            </Button>)}
            {(groups.includes("Direktori")) && (<Button
              key="AddNewEmployee"
              onClick={() => {
                handleCloseNavMenu()
                setShowScanNewDocument(false)
                setShowScanHistory(false)
                setShowArrivedDocuments(false)
                setShowAddNewEmployee(true)
              }}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Dodaj novog zaposlenika
            </Button>)}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Otvori postavke">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <Box>
                <Typography textAlign="center">Welcome {username}!</Typography>
              </Box>
              <MenuItem key="ChangePassword" onClick={() => {
                handleCloseUserMenu();
                // TODO
              }}>
                <Typography textAlign="center">Promijeni lozinku</Typography>
              </MenuItem>
              <MenuItem key="Logout" onClick={() => {
                handleCloseUserMenu();
                if (localStorage.getItem("authTokens")) {
                  localStorage.removeItem("authTokens");
                }
                window.location.replace('/login');
              }}>
                <Typography textAlign="center">Odjavi se</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
