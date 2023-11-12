import { useState, useEffect } from 'react'
import { jwtDecode } from "jwt-decode";

import AddEmployeeForm from './components/AddEmployeeForm'
import ScanNewDocument from './components/ScanNewDocument'
import ScanHistory from './components/ScanHistory'
import ResponsiveAppBar from './components/ResponsiveAppBar'
import ArrivedDocuments from './components/ArrivedDocuments';


async function fetchDocuments(url) {
  let accessToken = await JSON.parse(localStorage.getItem("authTokens")).access;

  return await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + String(accessToken)
    }
  }).then((response) => {
    switch (response.status){
      case 200:
        return response.json()
      case 401:
        window.location.replace('/login');
        break;
      default:
        // console.log(response)
        alert("Pogreška")
        break;
    }
  }).catch((error) => {
    alert(error)
  });
}


function App() {
  if (!localStorage.getItem("authTokens")) {
    window.location.replace('/login');
  }
  const decoded = jwtDecode(localStorage.getItem("authTokens"));

  const [showScanNewDocument, setShowScanNewDocument] = useState(false)
  const [showScanHistory, setShowScanHistory] = useState(true)
  const [showArrivedDocuments, setShowArrivedDocuments] = useState(false)
  const [showAddNewEmployee, setShowAddNewEmployee] = useState(false)

  const [username, setUsername] = useState(decoded["username"])
  const [groups, setGroups] = useState(decoded["groups"])
  const [documents, setDocuments] = useState([])
  const [arrivedDocumentsForSigning, setArrivedDocumentsForSigning] = useState([])
  const [arrivedDocumentsForConfirmation, setArrivedDocumentsForConfirmation] = useState([])
  const [arrivedDocumentsForRevision, setArrivedDocumentsForRevision] = useState([])
  
  useEffect(() => {
    async function fetchAndSet() {
      let res = null;
      if (groups.includes("Direktori")) {
        res = await fetchDocuments("http://127.0.0.1:8000/api/sviDokumenti/");
      } else {
        res = await fetchDocuments("http://127.0.0.1:8000/api/mojiDokumenti/");
      }
      setDocuments(res.dokumenti);

      if (groups.includes("Direktori")) {
        res = await fetchDocuments("http://127.0.0.1:8000/api/dokumentiZaPotpis/");
        setArrivedDocumentsForSigning(res.dokumenti);
      } else if (groups.includes("Revizori")) {
        res = await fetchDocuments("http://127.0.0.1:8000/api/dokumentiZaReviziju/");
        setArrivedDocumentsForRevision(res.dokumenti);
      } else if (groups.includes("Računovođe")) {
        res = await fetchDocuments("http://127.0.0.1:8000/api/dokumentiZaPotvrdu/");
        setArrivedDocumentsForConfirmation(res.dokumenti);
      }
    }
    fetchAndSet();
  }, [showScanHistory]);

  return (
    <div className="App">
      <ResponsiveAppBar
        username={username}
        groups={groups}
        setShowScanNewDocument={setShowScanNewDocument}
        setShowScanHistory={setShowScanHistory}
        setShowArrivedDocuments={setShowArrivedDocuments}
        setShowAddNewEmployee={setShowAddNewEmployee}
      />
      <hr/>
      {groups.includes("Direktori") && showAddNewEmployee && <AddEmployeeForm />}
      {showScanNewDocument && <ScanNewDocument 
        setShowScanNewDocument={setShowScanNewDocument}
        setShowScanHistory={setShowScanHistory}
        setShowArrivedDocuments={setShowArrivedDocuments}
        setShowAddNewEmployee={setShowAddNewEmployee}
      />}
      {showScanHistory && <ScanHistory documents={documents} />}
      {showArrivedDocuments && 
        <ArrivedDocuments
          arrivedDocumentsForConfirmation={arrivedDocumentsForConfirmation}
          arrivedDocumentsForRevision={arrivedDocumentsForRevision}
          arrivedDocumentsForSigning={arrivedDocumentsForSigning}
        />}
    </div>
  );
}

export default App;
