import * as React from 'react';
import { Navigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import { LoadingButton } from '@mui/lab';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';

import { url } from '../constants/constants.js';

const backend_url = url;

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://github.com/vilim-cro/InzenjerskiPristup">
        Inženjerski pristup, Digitalizacija
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function LoginApp() {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();
    if (event.target.username.value === "") {
      setLoading(false);
      alert("Molimo unesite korisničko ime.")
      return;
    }
    if (event.target.password.value === "") {
      setLoading(false);
      alert("Molimo unesite lozinku.")
      return;
    }
    const data = {
      username: event.target.username.value,
      password: event.target.password.value
    };
    await axios.post(backend_url + '/api/token/', data)
      .then((response) => {
        //console.log(response)
        switch (response.status) {
          case 200:
            // Ispisi podatke o korisniku dobivenu iz tokena
            let tokens = response.data;
            localStorage.setItem('authTokens', JSON.stringify(tokens));
            window.location.replace("/#/");
            break;
          default:
            alert("Greška prilikom prijave")
            break;
        }
      }
    ).catch((error) => {
      if (error.response === undefined) {
        alert("Greška prilikom prijave")
        console.log(error)
        return;
      }
      switch (error.response.status) {
        case 401:
          alert("Pogrešno korisničko ime ili lozinka")
          break;
        case 500:
          alert("Greška na serveru")
          break;
        default:
          alert(error)
          break;
      }
    });
    setLoading(false);
  }

  const authTokens = localStorage.getItem("authTokens");
  return authTokens ? <Navigate to="/"/> : (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoFocus
              //autoComplete='username'
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              //autoComplete='current-password'
            />
            {/* <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            /> */}
            <LoadingButton
              type="submit"
              loading={loading}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              <span>Sign In</span>
            </LoadingButton>
            {/*<Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  to_be_implemented
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2">
                  {"to_be_implemented"}
                </Link>
              </Grid>
          </Grid>*/}
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}