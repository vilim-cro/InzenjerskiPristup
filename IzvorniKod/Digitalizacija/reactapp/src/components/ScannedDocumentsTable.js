import React from 'react'
import Title from './Title'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'

const ScannedDocumentsTable = ({ documents }) => {
  return (
    <React.Fragment>
      <Title>Skenirani dokumenti</Title>
      <Table size="medium">
        <TableHead>
          <TableRow>
            <TableCell>ID dokumenta</TableCell>
            <TableCell>Tip dokumenta</TableCell>
            <TableCell>Datum skeniranja</TableCell>
            <TableCell>Potvrđen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell>{document.name}</TableCell>
              <TableCell>{document.type}</TableCell>
              <TableCell>{document.date}</TableCell>
              <TableCell>{document.file}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  )
}

export default ScannedDocumentsTable