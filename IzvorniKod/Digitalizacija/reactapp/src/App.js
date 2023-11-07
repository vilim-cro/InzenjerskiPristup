import { useState } from 'react'

import AddEmployeeForm from './components/AddEmployeeForm'
import ScanNewDocument from './components/ScanNewDocument'
import ScannedDocumentsTable from './components/ScannedDocumentsTable'
import ResponsiveAppBar from './components/ResponsiveAppBar'

const documents = [
  {
    id: 1,
    name: 'Dokument 1',
    type: 'Tip 1',
    date: '2021-01-01',
    file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 2,
    name: 'Dokument 2',
    type: 'Tip 2',
    date: '2021-01-02',
    file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 3,
    name: 'Dokument 3',
    type: 'Tip 3',
    date: '2021-01-03',
    file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 4,
    name: 'Dokument 4',
    type: 'Tip 4',
    date: '2021-01-04',
    file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 5,
    name: 'Dokument 5',
    type: 'Tip 5',
    date: '2021-01-05',
    file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  }
]

function App() {
  const [isDirector, setIsDirector] = useState(false)
  const [isAccountant, setIsAccountant] = useState(false)
  const [isRevisor, setIsRevisor] = useState(false)
  const [showDocuments, setShowDocuments] = useState(true)
  const [showScanNewDocument, setShowScanNewDocument] = useState(false)

  const addEmployee = async (employee) => {
    console.log(employee)
  }

  return (
    <div className="App">
      <ResponsiveAppBar setShowDocuments={setShowDocuments} setShowScanNewDocument={setShowScanNewDocument}/>
      <hr/>
      {isDirector && <AddEmployeeForm onAdd={addEmployee} />}
      {showScanNewDocument && <ScanNewDocument />}
      {showDocuments && <ScannedDocumentsTable documents={documents} />}
    </div>
  );
}

export default App;
