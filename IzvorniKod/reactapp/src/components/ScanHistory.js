import React from 'react'
import { Button, Select, MenuItem, Skeleton } from '@mui/material'
import { useState, useEffect } from 'react';
import { Link } from '@mui/material';
import { Box, Grid } from '@mui/material';
import { url } from '../constants/constants.js';

const backend_url = url;

const ScanHistory = ({ documents, openDocumentDetails, groups, setDocuments, documentsLoading }) => {
  const [scanConfirmations, setScanConfirmations] = useState(documents.map(() => null));
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [accuracies, setAccuracies] = useState(documents.map(doc => doc.točnoSkeniran));
  const [reviewerAssigned, setReviewerAssigned] = useState(documents.map((doc) => doc.revizor !== null));

  let userRole = groups.includes("Revizori") ? "Revizori" : "";
  const accessToken = JSON.parse(localStorage.getItem("authTokens"))?.access;
  
  useEffect(() => {
    const newAccuracies = documents.map(doc => doc.točnoSkeniran);
    setAccuracies(newAccuracies);
    setReviewerAssigned(documents.map((doc) => doc.revizor !== null));
  }, [documents]);

  useEffect(() => {
    if (reviewers.length > 0) {
      setSelectedReviewer(reviewers[0].id);
    }
  }, [reviewers]);

  useEffect(() => {
    const grupa = "Revizori";
    fetch(backend_url + `/api/dohvatiKorisnikeGrupe/${grupa}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(async response => {
      if (response.status === 401) {
        localStorage.removeItem("authTokens");
        window.location.href = "/#/login";
      } else if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.korisnici) {
        setReviewers(data.korisnici);
        setSelectedReviewer(data.korisnici[0].id);
      } else {
        throw new Error('Response data does not include korisnici');
      }
    })
    .catch(error => {
      console.error('An error occurred while fetching reviewers:', error);
    });
  }, [accessToken]);
  // Send a PUT request to assign the reviewer when selectedReviewer is updated
  
  const chooseReviewer = (selectedReviewer, documentId, index) => {
    let accessToken = JSON.parse(localStorage.getItem("authTokens"))?.access;
    if (selectedReviewer) {
      fetch(backend_url + `/api/dodijeliRevizora/${documentId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ korisnik_id: selectedReviewer })
      })
        .then(response => {
          if (response.status === 401) {
            localStorage.removeItem("authTokens");
            window.location.href = "/#/login";
          } else if (response.ok) {
            const newReviewerAssigned = [...reviewerAssigned];
            newReviewerAssigned[index] = true;
            setReviewerAssigned(newReviewerAssigned);
  
            // Update the documents state
            const newDocuments = [...documents];
            newDocuments[index].reviewer = selectedReviewer;
            setDocuments(newDocuments);
          } else
            {console.error('Failed to assign reviewer');}
          }
        ).catch(error => {
          console.error('An error occurred while assigning reviewer:', error)
        }
      );
    }
  };


  useEffect(() => {
    setScanConfirmations(documents.map(() => null));
  }, [documents]);

  const markAccuracy = (accuracy, documentId) => {
    let accessToken = JSON.parse(localStorage.getItem("authTokens"))?.access;
    fetch(backend_url + `/api/označiTočnostSkeniranja/${documentId}` , {
      method: 'PUT',
      headers: {
        "Authorization": "Bearer " + String(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tocnost: accuracy }), 
    })
    .then(response => {
      if (response.ok) {
        setAccuracies(prevAccuracies => {
          const newAccuracies = [...prevAccuracies];
          const documentIndex = documents.findIndex(doc => doc.id === documentId);
          newAccuracies[documentIndex] = accuracy;
          handleScanConfirmation(documentIndex, accuracy);
          if (userRole === "Revizori" && accuracy === true) {
            const scannerId = documents[documentIndex].korisnik;
            console.log('scannerId', scannerId)
            chooseReviewer(scannerId, documentId, documentIndex);
          }
          return newAccuracies;
        });
      } else {
        console.error('Failed to mark accuracy');
      }
    })
    .catch(error => {
      console.error('An error occurred while marking accuracy:', error);
    });
  };


  const handleScanConfirmation = (index, isCorrect) => {
    const newScanConfirmations = [...scanConfirmations];
    newScanConfirmations[index] = isCorrect;
    setScanConfirmations(newScanConfirmations);
  }

  return (
    <Box sx={{ marginLeft: 8, marginRight: 8, border: "1px solid black", borderRadius: 1, padding: 2 }} >
      <Box sx={{ overflowX: "auto" , overflowY: 'auto'}}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box fontSize={20} paddingBottom={2}>
              <Grid container justifyContent="space-between" alignItems="center" wrap="nowrap" columnSpacing={2} sx={{ minWidth: 'max-content', borderBottom: 1, borderColor: "black" }}>
                <Grid item xs={2} style={{ minWidth: '150px' }}>
                  <Box width="100%" textAlign="center">ID dokumenta</Box>
                </Grid>
                <Grid item xs={2} style={{ minWidth: '200px' }}>
                  <Box width="100%" textAlign="center">Tekst dokumenta</Box>
                </Grid>
                <Grid item xs={2} style={{ minWidth: '165px' }}>
                  <Box width="100%" textAlign="center">Vrijeme skeniranja</Box>
                </Grid>
                <Grid item xs={2} style={{ minWidth: '170px' }}>
                  <Box width="100%" textAlign="center">Točnost skeniranja</Box>
                </Grid>
                <Grid item xs={2} style={{ minWidth: '100px' }}>
                  <Box width="100%" textAlign="center">Potvrđen</Box>
                </Grid>
                <Grid item xs={2} style={{ minWidth: '100px' }}>
                  <Box width="100%" textAlign="center">Potpisan</Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          {documentsLoading ? (
            Array.from(new Array(5)).map((_, index) => (
              <Grid item xs={12} key={index}>
                <Skeleton variant="rounded" height={70} key={index} />
              </Grid>
            ))
          ) : (documents.map((document, index) => (
            <Grid item xs={12} key={index}>
              <Grid container justifyContent="space-between" alignItems="center" wrap="nowrap" columnSpacing={2}>
                <Grid item xs={2} style={{ minWidth: '150px' }}>
                  <Box width="100%" textAlign="center">
                    <Link component="button" variant="body2" onClick={() => openDocumentDetails(document, 'ScanHistory')}> 
                      ID:{document.id} 
                    </Link>
                  </Box>
                </Grid>
                  <Grid item xs={2} style={{ minWidth: '200px' }}><Box width="100%" paddingRight={15}>
                    {document.tekstDokumenta.length > 50 
                    ? document.tekstDokumenta.slice(0, 50) + '...' 
                    : document.tekstDokumenta}
                  </Box></Grid>
                <Grid item xs={2} style={{ minWidth: '165px' }}>
                  <Box width="100%" textAlign="center">{document.vrijemeSkeniranja}
                  </Box>
                </Grid>
                <Grid item xs={2} style={{ minWidth: '170px' }}>
                  <Box width="100%" textAlign="center">
                  {(accuracies[index] == null) && reviewerAssigned[index] === false ? (
                    <>
                      <Button variant="contained" color="primary" sx={{ marginRight: 0.2 }}
                      onClick={() => markAccuracy(true, document.id)}>
                        Da
                      </Button>
                      <Button variant="contained" color="secondary" sx={{ marginLeft: 0.2 }}
                      onClick={() => markAccuracy(false, document.id)}>
                        Ne
                      </Button>
                    </>
                  ) : accuracies[index] === true ? "" : "NE"}
                    {accuracies[index] === true && userRole !== 'Revizori' && reviewerAssigned[index] !== true && (
                      <Box display="flex" alignItems="center" justifyContent="center" p={1.2}>
                        <Grid container direction='column' spacing={2}>
                          <Grid item xs={12}>
                            <Select 
                              value={selectedReviewer} 
                              onChange={event => setSelectedReviewer(event.target.value)}
                              fullWidth
                              sx={{ mr: 1 }}
                            >
                              {reviewers.length > 0 && reviewers.map(reviewer => (
                                <MenuItem key={reviewer.id} value={reviewer.id}>
                                  {reviewer.username}
                                </MenuItem>
                              ))}
                            </Select>
                          </Grid>
                          <Grid item xs={12}>
                            <Button 
                              variant="contained" 
                              color="primary" 
                              fullWidth
                              onClick={() => chooseReviewer(selectedReviewer, document.id, index)}
                            >
                              Pošalji na reviziju
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                    {reviewerAssigned[index] && <p>Revizor dodijeljen</p>}
                  </Box>
                </Grid>
                <Grid item xs={2} style={{ minWidth: '100px' }}>
                  <Box width="100%" textAlign="center">
                    {document.potvrdioRevizor ? "DA" : "NE"}
                  </Box>
                </Grid>
                <Grid item xs={2} style={{ minWidth: '100px' }}>
                  <Box width="100%" textAlign="center">
                    {document.potpisaoDirektor ? "DA" : "NE"}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          )))}
        </Grid>
      </Box> 
    </Box>
  );
}

export default ScanHistory