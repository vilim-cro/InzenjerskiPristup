function DocumentDetails({ document, source, setShowDocumentDetails, setSelectedDocument, setShowScanHistory, 
  setShowArrivedDocuments}) {
  return (
    <div>
      <h1>Detalji dokumenta</h1>
      <img src={document.linkSlike} alt="Document" />
      <p>{document.tekstDokumenta}</p>
      <button
        onClick={() => {
          setShowDocumentDetails(false)
          setShowScanHistory(source === 'ScanHistory')
          setShowArrivedDocuments(source === 'ArrivedDocuments')
        }}
      >
        Close
      </button>
    </div>
  );
}

export default DocumentDetails;