function DocumentDetails({ document, setShowDocumentDetails, setSelectedDocument, setShowScanHistory }) {
  return (
    <div>
      <h1>Detalji dokumenta</h1>
      <img src={document.linkSlike} alt="Document" />
      <p>{document.tekstDokumenta}</p>
      <button
        onClick={() => {
          setShowDocumentDetails(false)
          setShowScanHistory(true)
        }}
      >
        Close
      </button>
    </div>
  );
}

export default DocumentDetails;