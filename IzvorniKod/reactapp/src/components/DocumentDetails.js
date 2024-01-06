import { Grid, Typography, Button, Box, Divider } from '@mui/material';

function DocumentDetails({ document, source, setShowDocumentDetails, setSelectedDocument, setShowScanHistory }) {
  return (
    <Box sx={{ marginLeft: 8, marginRight: 8, border: "1px solid black", borderRadius: 1, padding: 2 }}>
      <Box sx={{ pl: { xs: 1, sm: 1, md: 3 } }}> 
        <Grid container direction="column" spacing={2}>
          <Grid 
            item 
            container 
            xs={12} 
            sm={8} 
            md={6} 
            justifyContent="space-between"
            alignItems="center"
          > 
            <Typography variant="h4">Detalji dokumenta</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.scrollTo({ top: window.document.body.scrollHeight, behavior: 'smooth' })}
              sx={{ mr: { xs: 1, sm: 2, md: 5 } }}
            >
              Odi na dno stranice
            </Button>
          </Grid>
          <Grid item xs={12} sm={8} md={6}> 
            <Divider sx={{ borderColor: 'black' }} />
          </Grid>
          <Grid item xs={12} sm={8} md={6}> 
            <Typography 
              variant="body1"
              sx={{ fontSize: '1.5rem'}}
            >
              Slika dokumenta: 
            </Typography>
            <img src={document.linkSlike} alt="Document" style={{ maxWidth: '100%' }} />
          </Grid>
          <Grid item xs={12} sm={8} md={6}> 
            <Divider sx={{ borderColor: 'black' }} />
          </Grid>
          <Grid item xs={12} sm={8} md={6}> 
            <Typography 
              variant="body1"
              sx={{ fontSize: '1.5rem'}}
            >
              Tekst dokumenta: 
            </Typography>
            <Typography variant="body1">
              {document.tekstDokumenta}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8} md={6}> 
            <Divider sx={{ borderColor: 'black' }} />
          </Grid>
          <Grid item xs={6} sm={4} md={3}> 
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                setShowDocumentDetails(false)
                setShowScanHistory(source === 'ScanHistory')
                setShowArrivedDocuments(source === 'ArrivedDocuments')
              }}
            >
              Zatvori
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default DocumentDetails;