import React from 'react'
import { Alert, Grid, Paper, Typography} from '@mui/material';

import { url } from '../constants/constants.js';
import { LoadingButton } from '@mui/lab';

const backend_url = url;

export default function ScanNewDocument() {
  const [msg, setMsg] = React.useState("");
  const [msgType, setMsgType] = React.useState(""); // [success, error, warning]
  const [fileNum, setFileNum] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    console.log(event.target);
    if (fileNum === 0) {
      setLoading(false);
      setMsg("Niste učitali nijedan dokument");
      setMsgType("warning");
      return;
    } else if (fileNum > 50) {
      setLoading(false);
      setMsg("Možete učitati najviše 50 dokumenata odjednom");
      setMsgType("warning");
      return;
    }
    const formData = new FormData(event.target);

    let accessToken = await JSON.parse(localStorage.getItem("authTokens")).access;

    setMsgType("info");
    setMsg("Učitavanje...");
    await fetch(backend_url + '/api/noviDokument/', {
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + String(accessToken)
      },
      body: formData
    })
    .then(async data => {
      // Handle the response from the server
      switch (data.status) {
        case 201:
          setMsg("Dokument/i uspješno dodan/i.");
          setMsgType("success");
          break;
        case 207:
          let body = await data.json();
          console.log(body);
          let uspjelo = fileNum - body.failed;
          setMsg("Uspješno dodano " + uspjelo + " od " + fileNum + " dokumenata.\nPokušajte priložiti kvalitetnije fotografije za preostale dokumente (pazite da je dokument na slici pravokutnog oblika).");
          setMsgType("warning");
          break;
        case 401:
          localStorage.removeItem("authTokens");
          window.location.href = "/#/login";
          break;
        case 500:
          setMsg("Greška na serveru."); 
          setMsgType("error");
          break;
        default:
          setMsg("Greška prilikom dodavanja dokumenta. Kod " + data.status);
          setMsgType("error");
          break;
      }
      setLoading(false);
    })
    .catch(error => {
      // Handle errors
      console.error('Error:', error);
      setMsg("Greška prilikom dodavanja dokumenta.");
      setMsgType("error");
      setLoading(false);
    });
  }


  return (
    <Paper elevation={3} sx={{
      marginTop: 8,
      marginLeft: 16,
      marginRight: 16,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: 300,
    }}>
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid item xs={12} marginTop={2} marginBottom={1}>
          <Typography variant="h5" textAlign="center">Skeniraj novi dokument</Typography>
          <hr/>
        </Grid>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Grid item xs={12} marginBottom={2}>
            <input type='file' name='slika' multiple accept="image/*" onChange={ (e) => { setFileNum(e.target.files.length) } } />
          </Grid>
          <Grid item xs={12} textAlign="center" marginBottom={1}>
            <LoadingButton type="submit"
                           loading={loading}
                           variant="contained">
              <span>Učitaj</span>
            </LoadingButton>
          </Grid>
        </form>
        { msg && (
          <Grid item xs={12}>
            <Alert severity={ msgType }>{msg}</Alert>
          </Grid>
        )}
      </Grid>
    </Paper>
  )
}
