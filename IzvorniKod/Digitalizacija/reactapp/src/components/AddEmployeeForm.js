const { useState } = require("react")

const AddEmployeeForm = ({ onAdd }) => {
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

    onAdd({ ime, prezime, email, korisnickoIme, lozinka, uloga })

    setIme('')
    setPrezime('')
    setEmail('')
    setKorisnickoIme('')
    setLozinka('')
    setUloga('zaposlenik')
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
          <option value="direktor">Direktor</option>
          <option value="racunovoda">Računovođa</option>
          <option value="revizor">Revizor</option>
          <option value="zaposlenik">Zaposlenik</option>
        </select>
      </div>
      <input type="submit" value="Spremi"/>
    </form>
  )
}

export default AddEmployeeForm
