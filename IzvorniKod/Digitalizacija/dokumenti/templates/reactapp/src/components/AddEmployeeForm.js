import { useState } from 'react'

const AddEmployeeForm = () => {
  const [ime, setIme] = useState('')
  const [prezime, setPrezime] = useState('')
  const [email, setEmail] = useState('')
  const [korisnickoIme, setKorisnickoIme] = useState('')
  const [lozinka, setLozinka] = useState('')
  const [uloga, setUloga] = useState('zaposlenik')

  const onSubmit = (e) => {
    e.preventDefault()

    if (!ime) {
      alert('Unesite ime')
      return
    }

    if (!prezime) {
      alert('Unesite prezime')
      return
    }

    if (!email) {
      alert('Unesite email')
      return
    }

    if (!korisnickoIme) {
      alert('Unesite korisničko ime')
      return
    }

    if (!lozinka) {
      alert('Unesite lozinku')
      return
    }

    let accessToken = JSON.parse(localStorage.getItem("authTokens")).access;
    fetch(process.env.REACT_APP_BACKEND_URL + '/api/dodajKorisnika/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + String(accessToken)
        },
        body: JSON.stringify({
          "username": korisnickoIme,
          "password": lozinka,
          "ime": ime,
          "prezime": prezime,
          "email": email,
          "group": uloga
        },
    )})
      .then((response) => {
        switch (response.status) {
          case 201:
            alert("Zaposlenik uspješno dodan")
            break;
          case 401:
            window.location.replace('/login');
            break;
          default:
            alert("Greška prilikom dodavanja zaposlenika")
            break;
        }
      }).catch((error) => {
        alert(error)
      });

    setIme('')
    setPrezime('')
    setEmail('')
    setKorisnickoIme('')
    setLozinka('')
    setUloga('Zaposlenici')
  }

  return (
    <form className="add-form" onSubmit={onSubmit}>
      <div className="form-control">
        <label>Ime</label>
        <input
          type="text"
          placeholder="Unesite ime"
          value={ime}
          onChange={(e) => setIme(e.target.value)}
          />
      </div>
      <div className="form-control">
        <label>Prezime</label>
        <input
          type="text"
          placeholder="Unesite prezime"
          value={prezime}
          onChange={(e) => setPrezime(e.target.value)}
          />
      </div>
      <div className="form-control">
        <label>Email</label>
        <input
          type="email"
          placeholder="Unesite email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          />
      </div>
      <div className="form-control">
        <label>Korisničko ime</label>
        <input
          type="text"
          placeholder="Unesite korisničko ime"
          value={korisnickoIme}
          onChange={(e) => setKorisnickoIme(e.target.value)}
          />
      </div>
      <div className="form-control">
        <label>Lozinka</label>
        <input
          type="password"
          placeholder="Unesite lozinku"
          value={lozinka}
          onChange={(e) => setLozinka(e.target.value)}
          />
      </div>
      <div className="form-control">
        <label>Uloga</label>
        <select value={uloga} onChange={(e) => setUloga(e.target.value)}>
          <option value="Zaposlenici">Zaposlenik</option>
          <option value="Revizori">Revizor</option>
          <option value="Računovođe">Računovođa</option>
          <option value="Direktori">Direktor</option>
        </select>
      </div>
      <input type="submit" value="Spremi"/>
    </form>
  )
}

export default AddEmployeeForm
