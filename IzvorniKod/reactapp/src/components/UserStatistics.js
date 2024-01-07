import React from "react"
import { Box, Collapse, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { LinkedinIcon, LinkedinShareButton, RedditIcon, RedditShareButton } from "react-share";

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">{row[0].korisnik}</TableCell>
        <TableCell align="right">{row.length}</TableCell>
        <TableCell align="right">{row.filter((document) => document.točnoSkeniran).length}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Skenirani dokumenti
              </Typography>
              <Table size="small" aria-label="scanHistory">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Vrijeme skeniranja</TableCell>
                    <TableCell>Točno skeniran</TableCell>
                    <TableCell>Dodijeljeni revizor</TableCell>
                    <TableCell>Potvrđeno revizijom</TableCell>
                    <TableCell>Dodijeljeni računovođa</TableCell>
                    <TableCell>Dodijeljeni direktor za potpis</TableCell>
                    <TableCell>Potpisano</TableCell>
                    <TableCell>Podijeli</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell component="th" scope="row">{document.id}</TableCell>
                      <TableCell align="center">{document.vrijemeSkeniranja}</TableCell>
                      <TableCell align="center">{document.točnoSkeniran === true ? "DA" : document.točnoSkeniran === false ? "NE" : "—"}</TableCell>
                      <TableCell align="center">{document.revizor != null ? document.revizor : "—"}</TableCell>
                      <TableCell align="center">{document.potvrdioRevizor === true ? "DA" : document.točnoSkeniran === false ? "NE" : "—"}</TableCell>
                      <TableCell align="center">{document.računovođa != null ? document.računovođa : "—"}</TableCell>
                      <TableCell align="center">{document.direktor != null ? document.direktor : "—"}</TableCell>
                      <TableCell align="center">{document.potpisaoDirektor === true ? "DA" : document.točnoSkeniran === false ? "NE" : "—"}</TableCell>
                      <TableCell align="center">
                        <RedditShareButton
                          url={document.linkSlike}
                          title="🚀 Exciting Milestone Unlocked! 🚀"
                          summary="Thrilled to share a major achievement on my professional journey! 🎉 Today, I successfully scanned my first document using the cutting-edge Digitalizacija application! 📄💻

                          Embracing the power of digitization, I've taken a significant step towards streamlining processes and enhancing efficiency at [Firm Name]. 🌐✨ The seamless user interface and advanced features of Digitalizacija have truly revolutionized the way we handle documents, paving the way for a more sustainable and agile workplace.
                          
                          Grateful for the opportunity to contribute to our ongoing commitment to innovation and excellence. 🌟 Excited for the transformative impact this tool will have on our workflow and the incredible potential it holds for the future.
                          
                          Big thanks to the entire team for their support and to Digitalizacija for creating such a game-changing solution! 🙌🔗 #DigitalTransformation #DocumentScanning #InnovationAtWork #ProfessionalDevelopment #Teamwork"
                          source="digitalizacija.surge.sh"
                        >
                          <RedditIcon size={32} round={true} />
                        </RedditShareButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function UserStatistics({ documents }) {

  const [userDocumentsMap, setUserDocumentsMap] = React.useState(new Map());

  React.useEffect(() => {
    const updateUserDocumentsMap = () => {
      const newUserDocumentsMap = new Map();

      // Iterate over the documents array
      documents.forEach(document => {
        const user = document.korisnik;

        if (newUserDocumentsMap.has(user)) {
          newUserDocumentsMap.get(user).push(document);
        } else {
          newUserDocumentsMap.set(user, [document]);
        }
      });

      // Update the state with the new userDocumentsMap
      setUserDocumentsMap(newUserDocumentsMap);
      console.log(newUserDocumentsMap);
    };

    // Call the update function when documents change
    updateUserDocumentsMap();
  }, [documents]);

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
          <h2>Statistika korisnika</h2>
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Korisnik</TableCell>
                  <TableCell align="right">Ukupno skeniranih dokumenata</TableCell>
                  <TableCell align="right">Ukupno točno skeniranih dokumenata</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from(userDocumentsMap).map(([user, userDocuments]) => (
                  <Row key={user} row={userDocuments} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  )
}