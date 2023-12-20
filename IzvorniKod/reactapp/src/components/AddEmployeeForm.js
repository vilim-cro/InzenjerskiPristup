import { useState } from 'react'

import { url } from '../constants/constants.js';
import { Box, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';

const backend_url = url;

const AddEmployeeForm = () => {
  const [ime, setIme] = useState('')
  const [prezime, setPrezime] = useState('')
  const [email, setEmail] = useState('')
  const [korisnickoIme, setKorisnickoIme] = useState('')
  const [lozinka, setLozinka] = useState('')
  const [uloga, setUloga] = useState('Zaposlenici')
  const [loading, setLoading] = useState(false)

  const onSubmit = (e) => {
    setLoading(true)
    e.preventDefault()

    if (!ime) {
      alert('Unesite ime')
      return
    }

    if (!prezime) {
      alert('Unesite prezime')
      return
    }

    if (!email) {
      alert('Unesite email')
      return
    }

    if (!korisnickoIme) {
      alert('Unesite korisničko ime')
      return
    }

    if (!lozinka) {
      alert('Unesite lozinku')
      return
    }

    let accessToken = JSON.parse(localStorage.getItem("authTokens")).access;
    fetch(backend_url + '/api/dodajKorisnika/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + String(accessToken)
        },
        body: JSON.stringify({
          "username": korisnickoIme,
          "password": lozinka,
          "ime": ime,
          "prezime": prezime,
          "email": email,
          "group": uloga
        },
    )})
      .then((response) => {
        switch (response.status) {
          case 201:
            alert("Zaposlenik uspješno dodan")
            setIme('')
            setPrezime('')
            setEmail('')
            setKorisnickoIme('')
            setLozinka('')
            break;
          case 401:
            localStorage.removeItem("authTokens");
            window.location.href = "/#/login";
            break;
          default:
            alert("Greška prilikom dodavanja zaposlenika")
            break;
        }
        setLoading(false)
      }).catch((error) => {
        alert(error)
      });
  }

  const gridStyle = {
    paddingBottom: 2,
    paddingRight: 2,
    marginTop: 2,
    marginLeft: "auto",
    marginRight: "auto"
  }

  return (
    <Box sx={{
        marginTop: 8,
        marginLeft: 16,
        marginRight: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <form className="add-form" onSubmit={onSubmit}>
        <Grid container
              spacing={2}
              direction="row"
              justifyContent="center"
              alignItems="center"
              border={1}
              borderColor="grey.500"
              borderRadius={1}
              sx={gridStyle}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <TextField
                required
                id="ime"
                label="Ime"
                variant="outlined"
                value={ime}
                onChange={(e) => setIme(e.target.value)}
                />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <TextField
                required
                id="prezime"
                label="Prezime"
                value={prezime}
                onChange={(e) => setPrezime(e.target.value)}
                />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <TextField
                required
                id="email"
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <TextField
                required
                id="username"
                label="Korisničko ime"
                variant="outlined"
                value={korisnickoIme}
                onChange={(e) => setKorisnickoIme(e.target.value)}
                />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <TextField
                required
                id="password"
                type="password"
                label="Lozinka"
                variant="outlined"
                value={lozinka}
                onChange={(e) => setLozinka(e.target.value)}
                />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="role">Uloga</InputLabel>
              <Select required labelId="role" value={uloga} label="Uloga" onChange={(e) => setUloga(e.target.value)}>
                <MenuItem value="Zaposlenici">Zaposlenik</MenuItem>
                <MenuItem value="Revizori">Revizor</MenuItem>
                <MenuItem value="Računovođe">Računovođa</MenuItem>
                <MenuItem value="Direktori">Direktor</MenuItem>
              </Select>
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
      </form>
    </Box>
  )
}

export default AddEmployeeForm
