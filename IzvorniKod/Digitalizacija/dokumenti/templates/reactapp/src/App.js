import { useState, useEffect } from 'react'
import { jwtDecode } from "jwt-decode";

import AddEmployeeForm from './components/AddEmployeeForm'
import ScanNewDocument from './components/ScanNewDocument'
import ScanHistory from './components/ScanHistory'
import ResponsiveAppBar from './components/ResponsiveAppBar'


async function fetchDocuments() {
  let accessToken = await JSON.parse(localStorage.getItem("authTokens")).access;

  return await fetch("http://127.0.0.1:8000/api/dobaviInterneDokumente", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + String(accessToken)
    }
  }).then((response) => {
    switch (response.status){
      case 200:
        return response.json();
      case 401:
        window.location.replace('/login');
        break;
      default:
        console.log(response)
        alert("Pogreška")
        break;
    }
  }).catch((error) => {
    alert(error)
  });
}


function App() {
  const [showScanNewDocument, setShowScanNewDocument] = useState(false)
  const [showScanHistory, setShowScanHistory] = useState(true)
  const [showArrivedDocuments, setShowArrivedDocuments] = useState(false)
  const [showAddNewEmployee, setShowAddNewEmployee] = useState(false)

  const [username, setUsername] = useState("")
  const [documents, setDocuments] = useState([])
  const [groups, setGroups] = useState([])


  if (!localStorage.getItem("authTokens")) {
    window.location.replace('/login');
  }

  useEffect(() => {
    async function fetchAndSet() {
      const res = await fetchDocuments();
      setUsername(jwtDecode(localStorage.getItem("authTokens"))["username"]);
      setGroups(jwtDecode(localStorage.getItem("authTokens"))["groups"]);
      setDocuments(res);
    }
    fetchAndSet();
  }, []);

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
      {showScanNewDocument && <ScanNewDocument />}
      {showScanHistory && <ScanHistory documents={documents} />}
      
    </div>
  );
}

export default App;
