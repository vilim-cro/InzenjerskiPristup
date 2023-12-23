import { useState } from 'react'

import { url } from '../constants/constants.js';
import { Box, FormControl, Grid, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';

const backend_url = url;

export default function ChangePasswordForm ({
  setShowChangePasswordForm,
  setShowScanHistory
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    if (!currentPassword) {
      setLoading(false);
      alert('Unesite staru lozinku');
      return;
    }

    if (!newPassword) {
      setLoading(false);
      alert('Unesite novu lozinku');
      return;
    }

    if (currentPassword === newPassword) {
      setLoading(false);
      alert('Nova lozinka mora biti različita od stare');
      return;
    }

    let accessToken = await JSON.parse(localStorage.getItem("authTokens")).access;
    await fetch(backend_url + '/api/promijeniLozinku/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + String(accessToken)
        },
        body: JSON.stringify({
          "trenutnaLozinka": currentPassword,
          "novaLozinka": newPassword
        },
    )})
      .then((response) => {
        switch (response.status) {
          case 200:
            alert("Lozinka uspješno promijenjena");
            setCurrentPassword('');
            setNewPassword('');
            setShowChangePasswordForm(false);
            setShowScanHistory(true);
            break;
          case 401:
            localStorage.removeItem("authTokens");
            window.location.href = "/#/login";
            break;
          case 400:
            alert("Unesite ispravnu trenutnu lozinku");
            break;
          case 418:
            alert("Nova lozinka mora biti različita od stare");
            break;
          default:
            alert("Greška prilikom promjene lozinke");
            break;
        }
      }).catch((error) => {
        alert(error)
      });
      setLoading(false);
  }

  const gridStyle = {
    paddingBottom: 2,
    paddingRight: 2,
    marginTop: 2,
    marginLeft: "auto",
    marginRight: "auto"
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{
        marginTop: 8,
        marginLeft: 16,
        marginRight: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Grid container
            spacing={2}
            direction="row"
            justifyContent="center"
            alignItems="center"
            border={1}
            borderColor="grey.500"
            borderRadius={1}
            sx={gridStyle}>
        <Grid item xs={12} sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <h2>Promjena lozinke</h2>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <TextField
              required
              type="password"
              id="currentPassword"
              label="Trenutna lozinka"
              variant="outlined"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <TextField
              required
              type="password"
              id="newPassword"
              label="Nova lozinka"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              />
          </FormControl>
        </Grid>
        <Grid item xs={12} sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <LoadingButton  type="submit"
                          loading={loading}
                          variant="contained">
            <span>Spremi</span>
          </LoadingButton>
        </Grid>
      </Grid>
    </Box>
  )
}
