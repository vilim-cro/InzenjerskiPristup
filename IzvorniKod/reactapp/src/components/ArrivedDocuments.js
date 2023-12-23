import React, { useState } from 'react';
import Title from './Title'
import { MenuItem, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { Button, TextField } from '@mui/material';
import { url } from '../constants/constants.js';


const backend_url = url;

const ArrivedDocuments = ({
  supervisors,
  arrivedDocumentsForRevision,
  setArrivedDocumentsForRevision,
  arrivedDocumentsForConfirmation,
  setArrivedDocumentsForConfirmation,
  arrivedDocumentsForSigning,
  setArrivedDocumentsForSigning,
}) => {
  const getArrivedDocuments = () => {
    if (arrivedDocumentsForRevision && arrivedDocumentsForRevision.length > 0){
      return arrivedDocumentsForRevision;
    }else if((arrivedDocumentsForConfirmation && arrivedDocumentsForConfirmation.length > 0)){
      return arrivedDocumentsForConfirmation;
    }
    return [];
  }

  const [selectedSupervisors, setSelectedSupervisors] = useState(Object.fromEntries(
    getArrivedDocuments().map((doc) => [doc.id, ''])
  ));
  const [isSueprvisorSelected, setIsSupervisorSelected] = useState(Object.fromEntries(
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
      options.body = JSON.stringify({id : body});
    }

    fetch(backend_url + path + documentId, options)
      .then(data => {
        switch(data.status){
          case 200:
            if(array !== null){
              var updatedArray = array.filter((doc) => doc.id !== documentId);
              setFunc(updatedArray);
            }else{
              console.log('Boidy', options)
            }
            break;
          case 401:
            localStorage.removeItem("authTokens");
            window.location.href = "/#/login";
            break;
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
      handleFetch('/api/dodijeliRevizora/', documentId, null, null, selectedAccountant);
    }else{
      setIsSupervisorSelected(prevState => ({ ...prevState, [documentId]: false }));
    }
  }

  const handlePotvrdioRacunovodja = (documentId) => {
    //console.log('Potvrdio:', documentId);
    const selectedDirector = selectedSupervisors[documentId];
    if(selectedDirector){
      //console.log(selectedAccountant);
      handleFetch('/api/arhiviraj/', documentId, setArrivedDocumentsForConfirmation, arrivedDocumentsForConfirmation);
      handleFetch('/api/dodijeliDirektora/', documentId, null, null, selectedDirector);
    }else{
      setIsSupervisorSelected(prevState => ({ ...prevState, [documentId]: false }));
    }
  }

  return (
    <div>
      {(arrivedDocumentsForRevision && arrivedDocumentsForRevision.length > 0) && (
        <React.Fragment>
            <Title>Dokumenti pristigli na reviziju</Title>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Tekst dokumenta</TableCell>
                  <TableCell>Vrijeme skeniranja</TableCell>
                  <TableCell>Potvrđen</TableCell>
                  <TableCell>Potpisan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {arrivedDocumentsForRevision.map((document, index) => (
                  <TableRow key={index}>
                    <TableCell>{document.tekstDokumenta}</TableCell>
                    <TableCell>{document.vrijemeSkeniranja}</TableCell>
                    <TableCell>{document.potvrdioRevizor ? ("Da"
                      ) : (
                        <React.Fragment>
                          <Button variant='contained'
                            onClick={() => handlePotvrdioRevizor(document.id)}> Potvrdi</Button>
                          <TextField 
                            fullWidth
                            onChange={handleSupervisorChange(document.id)} 
                            value={selectedSupervisors[document.id]}
                            label="Računovođa"
                            select>
                        	  <MenuItem value= {''} disabled>Odaberite Računovođu</MenuItem>
                            {supervisors.map(supervisor => (
                              <MenuItem key={supervisor.id} value={supervisor.id}>
                                {supervisor.username}
                              </MenuItem>
                            ))}
                          </TextField>
                          {!isSueprvisorSelected[document.id] && (
                            <p style={{ color: 'red' }}>Obavezno je odabrati računovođu.</p>
                          )}
                        </React.Fragment>
                      )}</TableCell>
                    <TableCell>{document.potpisaoDirektor ? "Da" : "Ne"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </React.Fragment>
      )}
      {(arrivedDocumentsForConfirmation && arrivedDocumentsForConfirmation.length > 0) && (
        <React.Fragment>
            <Title>Dokumenti pristigli na knjiženje</Title>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Tekst dokumenta</TableCell>
                  <TableCell>Vrijeme skeniranja</TableCell>
                  <TableCell>Potvrđen</TableCell>
                  <TableCell>Potpisan</TableCell>
                  <TableCell>Arhiviran</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {arrivedDocumentsForConfirmation.map((document, index) => (
                  <TableRow key={index}>
                    <TableCell>{document.tekstDokumenta}</TableCell>
                    <TableCell>{document.vrijemeSkeniranja}</TableCell>
                    <TableCell>{document.potvrdioRevizor ? "Da" : "Ne"}</TableCell>
                    <TableCell>{document.potpisaoDirektor ? "Da" : "Ne"}</TableCell>
                    <TableCell>{document.potvrdioRevizor ? ("Da"
                      ) : (
                        <React.Fragment>
                          <Button variant="contained" 
                            onClick={() => handlePotvrdioRacunovodja(document.id)}> Arhiviraj</Button>
                          <TextField 
                            fullWidth
                            onChange={handleSupervisorChange(document.id)} 
                            value={selectedSupervisors[document.id]}
                            label="Direktor"
                            select>
                        	  <MenuItem value= {''} disabled>Odaberite Direktora</MenuItem>
                            {supervisors.map(supervisor => (
                              <MenuItem key={supervisor.id} value={supervisor.id}>
                                {supervisor.username}
                              </MenuItem>
                            ))}
                          </TextField>
                          {!isSueprvisorSelected[document.id] && (
                            <p style={{ color: 'red' }}>Obavezno je odabrati direktora.</p>
                          )}
                        </React.Fragment>
                      )}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </React.Fragment>
      )}
      {(arrivedDocumentsForSigning && arrivedDocumentsForSigning.length > 0) && (
        <React.Fragment>
            <Title>Dokumenti pristigli na potpis</Title>
            <Table size="medium">
              <TableHead >
                <TableRow>
                  <TableCell>Tekst dokumenta</TableCell>
                  <TableCell>Vrijeme skeniranja</TableCell>
                  <TableCell>Potvrđen</TableCell>
                  <TableCell>Potpisan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {arrivedDocumentsForSigning.map((document, index) => (
                  <TableRow key={index}>
                    <TableCell>{document.tekstDokumenta}</TableCell>
                    <TableCell>{document.vrijemeSkeniranja}</TableCell>
                    <TableCell>{document.potvrdioRevizor ? "Da" : "Ne"}</TableCell>
                    <TableCell>{document.potpisaoDirektor ? (
                      "Da"
                      ) : (
                        <Button variant='contained'
                          onClick={() => handlePotpisDirektor(document.id)}> Potpiši</Button>
                      )}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </React.Fragment>
      )}
    </div>
  )
}


export default ArrivedDocuments