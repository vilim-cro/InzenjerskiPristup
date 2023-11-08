import { useState, useEffect } from 'react'

import AddEmployeeForm from './components/AddEmployeeForm'
import ScanNewDocument from './components/ScanNewDocument'
import ScannedDocumentsTable from './components/ScannedDocumentsTable'
import ResponsiveAppBar from './components/ResponsiveAppBar'
import axios from 'axios'

function App() {
  const [isDirector, setIsDirector] = useState(false)
  const [isAccountant, setIsAccountant] = useState(false)
  const [isRevisor, setIsRevisor] = useState(false)
  const [showScanNewDocument, setShowScanNewDocument] = useState(false)
  const [showScanHistory, setShowScanHistory] = useState(true)
  const [showArrivedDocuments, setShowArrivedDocuments] = useState(false)
  const [showAddNewEmployee, setShowAddNewEmployee] = useState(false)

  const [documents, setDocuments] = useState([])
  const [groups, setGroups] = useState([])


  async function fetchAndSetDocuments() {
    let accessToken = JSON.parse(localStorage.getItem('authTokens')).access
    console.log(String(accessToken))

    // const res = await axios.get('http://127.0.0.1:8000/api/dobaviInterneDokumente', {
    //   'Authorization': 'Bearer ' + String(accessToken)
    // })
    const res = await fetch('http://127.0.0.1:8000/api/dobaviInterneDokumente', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + String(accessToken)
      }
    })
    // .then((response) => {
    //     console.log(response)
    //     switch(response.status){
    //       case 200:
    //         console.log(response.data)
    //         setDocuments(response.data.dokumenti)
    //         setGroups(response.data.grupe)
    //         break;
    //       default:
    //         alert("Greška prilikom dohvata dokumenata")
    //         break;
    //     }
    //   })
    //   .catch((error) => {
    //     alert(error)
    //   });
    //console.log(res);
    const data = await res.json();
    console.log(data);
    //setDocuments(data);
  }

  useEffect(() => {
    fetchAndSetDocuments();
  });

  return (
    <div className="App">
      <ResponsiveAppBar
        setIsDirector={setIsDirector}
        setIsAccountant={setIsAccountant}
        setIsRevisor={setIsRevisor}
        setShowScanNewDocument={setShowScanNewDocument}
        setShowScanHistory={setShowScanHistory}
        setShowArrivedDocuments={setShowArrivedDocuments}
        setShowAddNewEmployee={setShowAddNewEmployee}
      />
      <hr/>
      {isDirector && showAddNewEmployee && <AddEmployeeForm />}
      {showScanNewDocument && <ScanNewDocument />}
      {showScanHistory && <ScannedDocumentsTable documents={documents} />}
    </div>
  );
}

export default App;
