import { jwtDecode } from "jwt-decode";

import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AddEmployeeForm from '../components/AddEmployeeForm';
import ScanNewDocument from '../components/ScanNewDocument';
import ScanHistory from '../components/ScanHistory';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import ArrivedDocuments from '../components/ArrivedDocuments';
import ChangePasswordForm from '../components/ChangePasswordForm';
import DocumentDetails from '../components/DocumentDetails';

import { url } from '../constants/constants.js';

const backend_url = url;

function MainApp() {
  const authTokens = localStorage.getItem("authTokens");
  const decoded = authTokens ? jwtDecode(localStorage.getItem("authTokens")) : null;
  const username = decoded ? decoded["username"] : "";
  const groups = decoded ? decoded["groups"] : [];

  const [documents, setDocuments] = useState([]);
  const [source, setSource] = useState('');
  const [arrivedDocumentsForSigning, setArrivedDocumentsForSigning] = useState([]);
  const [arrivedDocumentsForConfirmation, setArrivedDocumentsForConfirmation] = useState([]);
  const [arrivedDocumentsForRevision, setArrivedDocumentsForRevision] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [accountants, setAccountants] = useState([]);

  const [showScanHistory, setShowScanHistory] = useState(true);
  const [showScanNewDocument, setShowScanNewDocument] = useState(false);
  const [showArrivedDocuments, setShowArrivedDocuments] = useState(false);
  const [showAddNewEmployee, setShowAddNewEmployee] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState({});

  const openDocumentDetails = (document, source) => {
    setSelectedDocument(document);
    setSource(source);
    setShowDocumentDetails(true);
    setShowScanHistory(false);
    setShowArrivedDocuments(false);
  };

  async function fetchDocuments(path) {
    let accessToken = await JSON.parse(localStorage.getItem("authTokens"))?.access;
  
    return accessToken ? await fetch(backend_url + path, {
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
          localStorage.removeItem("authTokens");
          window.location.href = "/#/login";
          break;
        default:
          // console.log(response)
          alert("Pogreška")
          break;
      }
    }).catch((error) => {
      console.log(error)
      alert(error)
    }) : null;
  }

  async function getUsersFromGroup(group) {
    try {
      let accessToken = JSON.parse(localStorage.getItem("authTokens"))?.access;
      const response = await fetch(backend_url + '/api/dohvatiKorisnikeGrupe/' + group, {
        method: 'GET',
        headers: {
          "Authorization": "Bearer " + String(accessToken),
        }
      });
  
      if (response.status === 200) {
        const data = await response.json();
        return data.korisnici;
      } else if (response.status === 401) {
        localStorage.removeItem("authTokens");
        window.location.href = "/#/login";
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };
  
  useEffect(() => {
    async function fetchAndSet() {
      let res = null;
      if (groups.includes("Direktori")) {
        res = await fetchDocuments("/api/sviDokumenti/");
      } else {
        res = await fetchDocuments("/api/mojiDokumenti/");
      }
      setDocuments(res ? res.dokumenti : []);

      if (groups.includes("Direktori")) {
        res = await fetchDocuments("/api/dokumentiZaPotpis/");
        setArrivedDocumentsForSigning(res ? res.dokumenti : []);
      } if (groups.includes("Revizori")) {
        res = await fetchDocuments("/api/dokumentiZaReviziju/");
        setArrivedDocumentsForRevision(res ? res.dokumenti : []);
        res = await getUsersFromGroup('Računovođe');
        setAccountants(res ? res : []);
      } if (groups.includes("Računovođe")) {
        res = await fetchDocuments("/api/dokumentiZaPotvrdu/");
        setArrivedDocumentsForConfirmation(res ? res.dokumenti : []);
        res = await getUsersFromGroup('Direktori');
        setDirectors(res ? res : []);
      }
  }
    fetchAndSet();
  }, [showScanHistory]);

  return !authTokens ? <Navigate to="/login" /> : (
    <div className="App">
      <ResponsiveAppBar
        username={username}
        groups={groups}
        setShowScanNewDocument={setShowScanNewDocument}
        setShowScanHistory={setShowScanHistory}
        setShowArrivedDocuments={setShowArrivedDocuments}
        setShowAddNewEmployee={setShowAddNewEmployee}
        setShowChangePasswordForm={setShowChangePasswordForm}
        setShowDocumentDetails={setShowDocumentDetails}
      />
      <hr/>
      {groups.includes("Direktori") && showAddNewEmployee && <AddEmployeeForm />}
      {showScanNewDocument && <ScanNewDocument/>}
      {showScanHistory && <ScanHistory 
        documents={documents} 
        openDocumentDetails={(document) => openDocumentDetails(document, 'ScanHistory')} 
        username={username} 
        groups={groups} 
        setDocuments={setDocuments}
       />}
       {showDocumentDetails && <DocumentDetails 
        document={selectedDocument} 
        source={source}
        setShowDocumentDetails={setShowDocumentDetails} 
        setShowScanHistory={setShowScanHistory}
        setShowArrivedDocuments={setShowArrivedDocuments} 
       />}
       {showArrivedDocuments && <ArrivedDocuments
        accountants={accountants}
        directors={directors}
        openDocumentDetails={(document) => openDocumentDetails(document, 'ArrivedDocuments')} 
        arrivedDocumentsForConfirmation={arrivedDocumentsForConfirmation}
        setArrivedDocumentsForConfirmation={setArrivedDocumentsForConfirmation}
        arrivedDocumentsForRevision={arrivedDocumentsForRevision}
        setArrivedDocumentsForRevision={setArrivedDocumentsForRevision}
        arrivedDocumentsForSigning={arrivedDocumentsForSigning}
        setArrivedDocumentsForSigning={setArrivedDocumentsForSigning}
      />}
      {showChangePasswordForm && <ChangePasswordForm
        setShowChangePasswordForm={setShowChangePasswordForm}
        setShowScanHistory={setShowScanHistory}
      />}
    </div>
  );
}

export default MainApp;
