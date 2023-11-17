import React from 'react'
import Title from './Title'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'

const ScanHistory = ({ documents }) => {
  return (
    <React.Fragment>
      <Title>Skenirani dokumenti</Title>
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
          {documents.map((document, index) => (
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
  )
}

export default ScanHistory