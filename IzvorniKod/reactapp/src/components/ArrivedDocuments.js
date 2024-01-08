import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Link, MenuItem, Skeleton, Tab, Tabs, TextField } from '@mui/material'
import { url } from '../constants/constants.js';


const backend_url = url;

const ArrivedDocuments = ({
  directors,
  accountants,
  openDocumentDetails,
  arrivedDocumentsForRevision,
  setArrivedDocumentsForRevision,
  arrivedDocumentsForConfirmation,
  setArrivedDocumentsForConfirmation,
  arrivedDocumentsForSigning,
  setArrivedDocumentsForSigning,
  arrivedDocumentsLoading
}) => {
  const [selectedTab, setSelectedTab] = useState(-1);
  const handleTabChange = (_event, newTab) => {
    setSelectedTab(newTab);
  }
  var tabsData = [
    {label: 'Dokumenti pristigli na reviziju', 
    condition: (arrivedDocumentsForRevision && arrivedDocumentsForRevision.length > 0)},
    {label: 'Dokumenti pristigli na knjiženje',
    condition: (arrivedDocumentsForConfirmation && arrivedDocumentsForConfirmation.length > 0)},
    {label: 'Dokumenti pristigli na potpis',
    condition: (arrivedDocumentsForSigning && arrivedDocumentsForSigning.length > 0)}
  ];
  useEffect(() => {
    const lowestFulfilledTabIndex = tabsData.findIndex(tab => tab.condition);
    if(selectedTab !== -1){
      if(tabsData[selectedTab].condition){
        return;
      }
    }

    if (selectedTab !== lowestFulfilledTabIndex) {
      setSelectedTab(lowestFulfilledTabIndex);
    }
  }, [arrivedDocumentsForRevision, arrivedDocumentsForConfirmation, arrivedDocumentsForSigning]);

  const getArrivedDocuments = () => {
    var arrivedDocs = [];
    if (arrivedDocumentsForRevision && arrivedDocumentsForRevision.length > 0){
      arrivedDocs = arrivedDocs.concat(arrivedDocumentsForRevision);
    }if((arrivedDocumentsForConfirmation && arrivedDocumentsForConfirmation.length > 0)){
      arrivedDocs = arrivedDocs.concat(arrivedDocumentsForConfirmation);
    }
    return arrivedDocs;
  }

  const [selectedSupervisors, setSelectedSupervisors] = useState(Object.fromEntries(
    getArrivedDocuments().map((doc) => [doc.id, ''])
  ));
  const [isSupervisorSelected, setIsSupervisorSelected] = useState(Object.fromEntries(
    getArrivedDocuments().map((doc) => [doc.id, true])
  ));
  

  const handleSupervisorChange = (documentId) => (event) => {
    setSelectedSupervisors(prevState => ({ ...prevState, [documentId]: event.target.value }));
  };

  const handleFetch = (path, documentId, setFunc = null, array = null, body = null) => {
    let accessToken = JSON.parse(localStorage.getItem("authTokens")).access;
    const options = {
      method: 'PUT',
      headers: {
        "Authorization": "Bearer " + String(accessToken),
        "Content-Type": "application/json"
      },
    }
    if(body !== null){
      options.body = JSON.stringify({korisnik_id : body});
    }

    fetch(backend_url + path + documentId, options)
      .then(data => {
        switch(data.status){
          case 200:
            if(array !== null){
              var updatedArray = array.filter((doc) => doc.id !== documentId);
              setFunc(updatedArray);
            }
            break;
          case 401:
            localStorage.removeItem("authTokens");
            window.location.href = "/#/login";
            break;
          default:
            alert('Greška' + data.status);
        }
    });
  }

  const handlePotpisDirektor = (documentId) => {
    //console.log(documentId);
    handleFetch('/api/potpiši/', documentId, setArrivedDocumentsForSigning, arrivedDocumentsForSigning);
  }

  const handlePotvrdioRevizor = (documentId) => {
    //console.log('Potvrdio:', documentId);
    const selectedAccountant = selectedSupervisors[documentId];
    if(selectedAccountant){
      //console.log(selectedAccountant);
      handleFetch('/api/potvrdi/', documentId, setArrivedDocumentsForRevision, arrivedDocumentsForRevision);
      handleFetch('/api/dodijeliRačunovođu/', documentId, null, null, selectedAccountant);
    }else{
      setIsSupervisorSelected(prevState => ({ ...prevState, [documentId]: false }));
    }
  }

  const handlePoslanoNaPotpis = (documentId) => {
    //console.log('Potvrdio:', documentId);
    const selectedDirector = selectedSupervisors[documentId];
    if(selectedDirector){
      //console.log(selectedAccountant);
      handleFetch('/api/dodijeliDirektora/', documentId, setArrivedDocumentsForConfirmation, arrivedDocumentsForConfirmation, selectedDirector);
    }else{
      setIsSupervisorSelected(prevState => ({ ...prevState, [documentId]: false }));
    }
  }

  const handleArhiviranje = (documentId) => {
    handleFetch('/api/arhiviraj/', documentId, setArrivedDocumentsForConfirmation, arrivedDocumentsForConfirmation);
  }

  const gridStyle = {
    paddingBottom: 2,
    paddingRight: 2,
    marginTop: 2,
    marginLeft: "auto",
    marginRight: "auto"
  }

  return (
    <div>
      {(arrivedDocumentsLoading || selectedTab === -1) ? (
        <Box sx={{
          marginTop: 8,
          marginLeft: 16,
          marginRight: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Grid container
                spacing={2}
                direction="row"
                justifyContent="center"
                alignItems="center"
                border={1}
                borderColor="grey.500"
                borderRadius={1}
                sx={gridStyle}>
              {arrivedDocumentsLoading ? Array.from(new Array(5)).map((_, index) => (
                <Grid item xs={12} key={index}>
                  <Skeleton variant="rounded" height={70} key={index} />
                </Grid>
              )) : (
                <Grid item xs={12} sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <h2>Nema pristiglih dokumenata</h2>
                </Grid>
              )}
          </Grid>
        </Box>
      ) : (
      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ marginBottom: 2 }}>
        {tabsData.map((tab, index) => (
          <Tab key={index} label={tab.label} style={{ display: tab.condition ? 'block' : 'none' }} />
        ))}
      </Tabs>
      )}
      {(!arrivedDocumentsLoading && selectedTab === 0 && arrivedDocumentsForRevision?.length > 0) && (
        <React.Fragment>
          <Box sx={{ marginLeft: 8, marginRight: 8, border: "1px solid black", borderRadius: 1, padding: 2 }} >
            <Box sx={{ overflowX: "auto" , overflowY: 'auto'}}>
              <Grid container spacing={2}>
                <Grid item xs={12}>  
                  <Box fontSize={20} paddingBottom={2}>
                    <Grid container justifyContent="space-between" paddingBottom={1} alignItems="center" wrap="nowrap" columnSpacing={2} sx={{ minWidth: 'max-content', borderBottom: 1, borderColor: "black" }}>
                      <Grid item xs={2} style={{ minWidth: '150px' }}>
                        <Box width="100%" textAlign="center">ID</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '200px' }}>
                        <Box width="100%" textAlign="center">Tekst dokumenta</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '150px' }}>
                        <Box width="100%" textAlign="center">Vrijeme</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '250px' }}>
                        <Box width="100%" textAlign="center">Potvrđen</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '150px' }}>
                        <Box width="100%" textAlign="center">Potpisan</Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
                {arrivedDocumentsForRevision.map((document, index) => (
                  <Grid item xs={12} key={index}>
                    <Grid container justifyContent="space-between" alignItems="center" wrap="nowrap" columnSpacing={2}>
                      <Grid item xs={2} style={{ minWidth: '150px' }}>
                        <Box width="100%" textAlign="center">
                          <Link component="button" variant="body2" onClick={() => openDocumentDetails(document, 'ArrivedDocuments')}> 
                            ID:{document.id} 
                          </Link>
                        </Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '200px' }}>
                        <Box width="100%" paddingRight={15}>
                          {document.tekstDokumenta.length > 50  ? document.tekstDokumenta.slice(0, 50) + '...'  : document.tekstDokumenta}
                        </Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '150px' }}>
                        <Box width="100%" textAlign="center">{document.vrijemeSkeniranja}</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '250px' }}>
                        <Box width="100%" textAlign="center">
                        {document.potvrdioRevizor ? ("Da") :(
                            <React.Fragment>
                                  <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={8}>
                                    <TextField   fullWidth onChange={handleSupervisorChange(document.id)}  value={selectedSupervisors[document.id]} label="Računovođa" select>
                                <MenuItem value= {''} disabled>Odaberite Računovođu</MenuItem>
                                  {accountants.map(supervisor => (
                                    <MenuItem key={supervisor.id} value={supervisor.id}>
                                      {supervisor.username}
                                    </MenuItem>
                                  ))}
                              </TextField>
                                {!isSupervisorSelected[document.id] && (
                                  <p style={{ color: 'red' }}>Obavezno je odabrati računovođu.</p>
                                )}
                              </Grid>
                              <Grid item xs={4}>
                                <Button variant='contained'
                                  onClick={() => handlePotvrdioRevizor(document.id)}> Potvrdi</Button>
                              </Grid>
                            </Grid>
                          </React.Fragment>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '150px' }}>
                      <Box width="100%" textAlign="center">
                        {document.potpisaoDirektor ? "DA" : "NE"}
                      </Box>
                    </Grid>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </React.Fragment>
      )}
      {(!arrivedDocumentsLoading && selectedTab === 1 && arrivedDocumentsForConfirmation?.length > 0) && (
        <React.Fragment>
          <Box sx={{ marginLeft: 8, marginRight: 8, border: "1px solid black", borderRadius: 1, padding: 2 }} >
            <Box sx={{ overflowX: "auto" , overflowY: 'auto'}}>
              <Grid container spacing={2} justifyContent={'center'}>
                <Grid item xs={12}>  
                  <Box fontSize={20} paddingBottom={2}>
                    <Grid container justifyContent="space-between" alignItems="center" wrap="nowrap" columnSpacing={2} sx={{ minWidth: 'max-content', borderBottom: 1, borderColor: "black" }}>
                      <Grid item xs={2} style={{ minWidth: '100px' }}>
                        <Box width="100%" textAlign="center">ID</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '150px' }}>
                        <Box width="100%" textAlign="center">Tekst dokumenta</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '150px' }}>
                        <Box width="100%" textAlign="center">Vrijeme</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '100px' }}>
                        <Box width="100%" textAlign="center">Potvrđen</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '200px' }}>
                        <Box width="100%" textAlign="center">Potpisan</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '150px' }}>
                        <Box width="100%" textAlign="center">Arhiviran</Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
                {arrivedDocumentsForConfirmation.map((document, index) => (
                  <Grid item xs={12} key={index}>
                    <Grid container justifyContent="space-between" alignItems="center" wrap="nowrap" columnSpacing={2}>
                      <Grid item xs={2} style={{ minWidth: '100px' }}>
                        <Box width="100%" textAlign="center">
                          <Link component="button" variant="body2" onClick={() => openDocumentDetails(document, 'ArrivedDocuments')}> 
                            ID:{document.id} 
                          </Link>
                        </Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '150px' }}>
                        <Box width="100%" paddingRight={15}>
                          {document.tekstDokumenta.length > 50 
                          ? document.tekstDokumenta.slice(0, 50) + '...' 
                          : document.tekstDokumenta}
                        </Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '150px' }}>
                        <Box width="100%" textAlign="center">{document.vrijemeSkeniranja}</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '100px' }}>
                        <Box width="100%" textAlign="center">
                          {document.potvrdioRevizor ? "Da" : "Ne"}
                        </Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '250px' }}>
                        <Box width="100%" textAlign="center">
                          {document.potpisaoDirektor ? ("Da") :(
                            <React.Fragment>
                              <Grid container spacing={2} alignItems="center" flexDirection="column">
                                <Grid item xs={12}>
                                  <Box width={200}>
                                    <TextField fullWidth onChange={handleSupervisorChange(document.id)} value={selectedSupervisors[document.id]} label="Direktor" select>
                                      <MenuItem value= {''} disabled>Odaberite Direktora</MenuItem>
                                      {directors.map(supervisor => (
                                        <MenuItem key={supervisor.id} value={supervisor.id}>
                                          {supervisor.username}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                    {!isSupervisorSelected[document.id] && (
                                      <p style={{ color: 'red' }}>Obavezno je odabrati direktora.</p>
                                    )}
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Box width={200}>
                                    <Button variant="contained" fullWidth onClick={() => handlePoslanoNaPotpis(document.id)}>Pošalji</Button>
                                  </Box>
                                </Grid>
                              </Grid>
                            </React.Fragment>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '150px' }}>
                      <Box width="100%" textAlign="center">
                        <Button variant="contained" 
                          onClick={() => handleArhiviranje(document.id)}> Arhiviraj
                        </Button>
                      </Box>
                    </Grid>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </React.Fragment>
      )}
      {(!arrivedDocumentsLoading && selectedTab === 2 && arrivedDocumentsForSigning?.length > 0) && (
        <React.Fragment>
          <Box sx={{ marginLeft: 8, marginRight: 8, border: "1px solid black", borderRadius: 1, padding: 2 }} >
            <Box sx={{ overflowX: "auto" , overflowY: 'auto'}}>
              <Grid container spacing={2} >
                <Grid item xs={12}>  
                  <Box fontSize={20} paddingBottom={2}>
                    <Grid container justifyContent="space-between" alignItems="center" wrap="nowrap" columnSpacing={2} 
                    paddingBottom={1} sx={{ minWidth: 'max-content', borderBottom: 1, borderColor: "black" }}>
                      <Grid item xs={2} style={{ minWidth: '150px' }}>
                        <Box width="100%" textAlign="center">ID dokumenta</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '200px' }}>
                        <Box width="100%" textAlign="center">Tekst dokumenta</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '200px' }}>
                        <Box width="100%" textAlign="center">Vrijeme skeniranja</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '150px' }}>
                        <Box width="100%" textAlign="center">Potvrđen</Box>
                      </Grid>
                      <Grid item xs={2} style={{ minWidth: '200px' }}>
                        <Box width="100%" textAlign="center">Potpisan</Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
                {arrivedDocumentsForSigning.map((document, index) => (
                  <Grid item xs={12} key={index}>
                    <Grid container justifyContent="space-between" alignItems="center" wrap="nowrap" columnSpacing={2}>
                      <Grid item xs={2} style={{minWidth: '150px'}}>
                        <Box width="100%" textAlign="center">
                          <Link component="button" variant="body2" onClick={() => openDocumentDetails(document, 'ArrivedDocuments')}> 
                            ID:{document.id} 
                          </Link>
                        </Box>
                      </Grid>
                      <Grid item xs={2} style={{minWidth: '200px'}}>
                        <Box width="100%" paddingRight={15}>
                          {document.tekstDokumenta.length > 50 ? document.tekstDokumenta.slice(0, 50) + '...' 
                          : document.tekstDokumenta}
                        </Box>
                      </Grid>
                      <Grid item xs={2} style={{minWidth: '200px'}}>
                        <Box width="100%" textAlign="center">{document.vrijemeSkeniranja}</Box>
                      </Grid>
                      <Grid item xs={2} style={{minWidth: '150px'}}>
                        <Box width="100%" textAlign="center">
                         {document.potvrdioRevizor ? "Da" : "Ne"}
                        </Box>
                      </Grid>
                      <Grid item xs={2} style={{minWidth: '200px'}}>
                      <Box width="100%" textAlign="center">
                       {document.potpisaoDirektor ? ("Da") : (
                        <Button variant='contained'
                          onClick={() => handlePotpisDirektor(document.id)}> Potpiši
                        </Button>
                       )}
                      </Box>
                    </Grid>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </React.Fragment>
      )}
    </div>
  )
}


export default ArrivedDocuments