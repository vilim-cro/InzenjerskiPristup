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
                            setShowAddNewEmployee,
                            setShowChangePasswordForm,
                            setShowDocumentDetails,
                            setShowUserStatistics }) {

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
    <AppBar position="static" sx={{ minWidth: "400px" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
              minWidth: '200px',
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
                handleCloseNavMenu();
                setShowScanNewDocument(true);
                setShowScanHistory(false);
                setShowArrivedDocuments(false);
                setShowAddNewEmployee(false);
                setShowChangePasswordForm(false);
                setShowDocumentDetails(false);
                setShowUserStatistics(false);
              }}>
                <Typography textAlign="center">Skeniraj novi dokument</Typography>
              </MenuItem>
              <MenuItem key="ShowScanHistory" onClick={() => {
                handleCloseNavMenu();
                setShowScanNewDocument(false);
                setShowScanHistory(true);
                setShowArrivedDocuments(false);
                setShowAddNewEmployee(false);
                setShowChangePasswordForm(false);
                setShowDocumentDetails(false);
                setShowUserStatistics(false);
              }}>
                <Typography textAlign="center">Povijest skeniranja</Typography>
              </MenuItem>
              {
                (groups.filter((group) => group==="Direktori" || group==="Revizori" || group==="Računovođe").length > 0) && (
                  <MenuItem key="ArrivedDocuments" onClick={() => {
                    handleCloseNavMenu();
                    setShowScanNewDocument(false);
                    setShowScanHistory(false);
                    setShowArrivedDocuments(true);
                    setShowAddNewEmployee(false);
                    setShowChangePasswordForm(false);
                    setShowDocumentDetails(false);
                    setShowUserStatistics(false);
                  }}>
                    <Typography textAlign="center">Pristigli dokumenti</Typography>
                  </MenuItem>
                )
              }
              {(groups.includes("Direktori")) && (
                <MenuItem key="AddNewEmployee" onClick={() => {
                  handleCloseNavMenu();
                  setShowScanNewDocument(false);
                  setShowScanHistory(false);
                  setShowArrivedDocuments(false);
                  setShowAddNewEmployee(true);
                  setShowChangePasswordForm(false);
                  setShowDocumentDetails(false);
                  setShowUserStatistics(false);
                }}>
                  <Typography textAlign="center">Dodaj novog zaposlenika</Typography>
                </MenuItem>
                )}
              {(groups.includes("Direktori")) && (
                <MenuItem key="UserStatistics" onClick={() => {
                  handleCloseNavMenu();
                  setShowScanNewDocument(false);
                  setShowScanHistory(false);
                  setShowArrivedDocuments(false);
                  setShowAddNewEmployee(false);
                  setShowChangePasswordForm(false);
                  setShowDocumentDetails(false);
                  setShowUserStatistics(true);
                }}>
                  <Typography textAlign="center">Statistika</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
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
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex', marginRight: 35, justifyContent: "space-around" } }}>
            <Button
              key="ScanNewDocument"
              onClick={() => {
                handleCloseNavMenu();
                setShowScanNewDocument(true);
                setShowScanHistory(false);
                setShowArrivedDocuments(false);
                setShowAddNewEmployee(false);
                setShowChangePasswordForm(false);
                setShowDocumentDetails(false);
                setShowUserStatistics(false);
              }}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Skeniraj novi dokument
            </Button>
            <Button
              key="ScanHistory"
              onClick={() => {
                handleCloseNavMenu();
                setShowScanNewDocument(false);
                setShowScanHistory(true);
                setShowArrivedDocuments(false);
                setShowAddNewEmployee(false);
                setShowChangePasswordForm(false);
                setShowDocumentDetails(false);
                setShowUserStatistics(false);
              }}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Povijest skeniranja
            </Button>
            {(groups.filter((group) => group==="Direktori" || group==="Revizori" || group==="Računovođe").length > 0) && (<Button
              key="ArrivedDocuments"
              onClick={() => {
                handleCloseNavMenu();
                setShowScanNewDocument(false);
                setShowScanHistory(false);
                setShowArrivedDocuments(true);
                setShowAddNewEmployee(false);
                setShowChangePasswordForm(false);
                setShowDocumentDetails(false);
                setShowUserStatistics(false);
              }}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Pristigli dokumenti
            </Button>)}
            {(groups.includes("Direktori")) && (<>
              <Button
                key="AddNewEmployee"
                onClick={() => {
                  handleCloseNavMenu();
                  setShowScanNewDocument(false);
                  setShowScanHistory(false);
                  setShowArrivedDocuments(false);
                  setShowAddNewEmployee(true);
                  setShowChangePasswordForm(false);
                  setShowDocumentDetails(false);
                  setShowUserStatistics(false);
                }}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Dodaj novog zaposlenika
              </Button>
              <Button
                key="UserStatistics"
                onClick={() => {
                  handleCloseNavMenu();
                  setShowScanNewDocument(false);
                  setShowScanHistory(false);
                  setShowArrivedDocuments(false);
                  setShowAddNewEmployee(false);
                  setShowChangePasswordForm(false);
                  setShowDocumentDetails(false);
                  setShowUserStatistics(true);
                }}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Statistika
              </Button>
            </>)}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Otvori postavke">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar sx={{backgroundColor: 'white'}}>
                  <AdbIcon sx={{ color: "#1976d2" }} />
                </Avatar>
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
              <Box sx={{marginLeft: 1, marginRight: 1}}>
                <Typography textAlign="center"><strong>Welcome {username}!</strong></Typography>
              </Box>
              <hr/>
              <MenuItem key="ChangePassword" onClick={() => {
                handleCloseUserMenu();
                setShowScanNewDocument(false);
                setShowScanHistory(false);
                setShowArrivedDocuments(false);
                setShowAddNewEmployee(false);
                setShowChangePasswordForm(true);
                setShowDocumentDetails(false);
                setShowUserStatistics(false);
              }}>
                <Typography textAlign="center">Promijeni lozinku</Typography>
              </MenuItem>
              <MenuItem key="Logout" onClick={() => {
                handleCloseUserMenu();
                if (localStorage.getItem("authTokens")) {
                  localStorage.removeItem("authTokens");
                }
                window.location.href = '/#/login';
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
