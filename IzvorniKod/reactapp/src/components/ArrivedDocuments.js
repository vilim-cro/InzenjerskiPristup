import React from 'react'
import Title from './Title'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'

const ArrivedDocuments = ({
  arrivedDocumentsForRevision,
  arrivedDocumentsForConfirmation,
  arrivedDocumentsForSigning,
}) => {
  return (
    <div>
      {(arrivedDocumentsForRevision && arrivedDocumentsForRevision.size > 0) && (
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
                    <TableCell>{document.potvrdioRevizor ? "Da" : "Ne"}</TableCell>
                    <TableCell>{document.potpisaoDirektor ? "Da" : "Ne"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </React.Fragment>
      )}
      {(arrivedDocumentsForConfirmation && arrivedDocumentsForConfirmation.size > 0) && (
        <React.Fragment>
            <Title>Dokumenti pristigli na knjiženje</Title>
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
                {arrivedDocumentsForConfirmation.map((document, index) => (
                  <TableRow key={index}>
                    <TableCell>{document.tekstDokumenta}</TableCell>
                    <TableCell>{document.vrijemeSkeniranja}</TableCell>
                    <TableCell>{document.potvrdioRevizor ? "Da" : "Ne"}</TableCell>
                    <TableCell>{document.potpisaoDirektor ? "Da" : "Ne"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </React.Fragment>
      )}
      {(arrivedDocumentsForSigning && arrivedDocumentsForSigning.size > 0) && (
        <React.Fragment>
            <Title>Dokumenti pristigli na potpis</Title>
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
                {arrivedDocumentsForSigning.map((document, index) => (
                  <TableRow key={index}>
                    <TableCell>{document.tekstDokumenta}</TableCell>
                    <TableCell>{document.vrijemeSkeniranja}</TableCell>
                    <TableCell>{document.potvrdioRevizor ? "Da" : "Ne"}</TableCell>
                    <TableCell>{document.potpisaoDirektor ? "Da" : "Ne"}</TableCell>
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