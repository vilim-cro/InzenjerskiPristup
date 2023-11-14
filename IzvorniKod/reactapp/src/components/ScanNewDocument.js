import React from 'react'

import Title from './Title'

import { url } from '../constants/constants.js';

const backend_url = url;

export default function ScanNewDocument({
    setShowScanNewDocument,
    setShowScanHistory,
    setShowArrivedDocuments,
    setShowAddNewEmployee
}) {

  const handleSubmit = (event) => {
    event.preventDefault();
      
      // Add logic for handling form submission, e.g., sending a request to the server
      // You can use FormData to handle file uploads
      
      const formData = new FormData(event.target);
      let accessToken = JSON.parse(localStorage.getItem("authTokens")).access;
      
      fetch(backend_url + '/api/noviDokument/', {
        method: 'POST',
        headers: {
          "Authorization": "Bearer " + String(accessToken)
        },
        body: formData
      })
      .then(data => {
        // Handle the response from the server
        console.log(data);
        console.log(data.status);
        switch (data.status) {
          case 201:
            alert("Dokument uspješno dodan")
            setShowAddNewEmployee(false);
            setShowScanHistory(true);
            setShowScanNewDocument(false);
            setShowArrivedDocuments(false);
            break;
          case 401:
            window.location.href = "/#/login";
            break;
          default:
            alert("Greška prilikom dodavanja dokumenta");
            break;
        }
      })
      .catch(error => {
        // Handle errors
        console.error('Error:', error);
        alert(error)
      });
  }


  return (
    <div>
      <Title>Skeniraj novi dokument</Title>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type='file' name='slika' multiple accept="image/*" />
        <input type='submit' value="Submit"/>
      </form>
    </div>
  )
}
