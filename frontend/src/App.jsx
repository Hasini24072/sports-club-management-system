import { useEffect, useState } from 'react'
import './App.css'

const API = '/api/players'

const emptyPlayer = {
  playerId: '',
  name: '',
  age: '',
  sport: '',
  membershipType: 'Basic',
  membershipStatus: 'Active',
}

function App() {
  const [players, setPlayers] = useState([])
  const [player, setPlayer] = useState(emptyPlayer)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadPlayers() {
    try {
      const response = await fetch(API)

      if (!response.ok) {
        throw new Error('Unable to load players')
      }

      const data = await response.json()
      setPlayers(data)
    } catch (error) {
      setMessage(
        'Cannot connect to the server. Make sure MongoDB and Node.js are running.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlayers()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setPlayer(previous => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!player.name.trim() || !player.sport) {
      setMessage('Please enter the player name and select a sport.')
      return
    }

    const payload = {
      playerId: Number(player.playerId),
      name: player.name.trim(),
      age: Number(player.age),
      sport: player.sport,
      membershipType: player.membershipType,
      membershipStatus: player.membershipStatus,
    }

    if (
      !Number.isInteger(payload.playerId) ||
      payload.playerId <= 0 ||
      !Number.isInteger(payload.age) ||
      payload.age < 1 ||
      payload.age > 120
    ) {
      setMessage('Enter a valid player ID and age.')
      return
    }

    try {
      const response = await fetch(
        editingId === null ? API : `${API}/${editingId}`,
        {
          method: editingId === null ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to save player')
      }

      setMessage(result.message || 'Player saved successfully!')
      setPlayer({ ...emptyPlayer })
      setEditingId(null)

      await loadPlayers()
    } catch (error) {
      setMessage(error.message)
    }
  }

  function editPlayer(item) {
    setPlayer({
      playerId: String(item.playerId),
      name: item.name,
      age: String(item.age),
      sport: item.sport,
      membershipType: item.membershipType || 'Basic',
      membershipStatus: item.membershipStatus || 'Active',
    })

    setEditingId(item.playerId)
    setMessage('Update the details and click Save Changes.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deletePlayer(id) {
    if (!window.confirm('Are you sure you want to delete this player?')) {
      return
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to delete player')
      }

      setMessage(result.message || 'Player deleted successfully!')

      if (editingId === id) {
        setPlayer({ ...emptyPlayer })
        setEditingId(null)
      }

      await loadPlayers()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const filteredPlayers = players.filter(item =>
    `${item.playerId} ${item.name} ${item.sport}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const activeMembers = players.filter(
    item => (item.membershipStatus || 'Active') === 'Active'
  ).length

  const totalSports = new Set(
    players.map(item => item.sport).filter(Boolean)
  ).size

  return (
    <div className="app">
      <header className="site-header">
        <a className="brand" href="#home">
          🏆 Sports Club
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#players">Players</a>
          <a href="#register">Register Player</a>
        </nav>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <p className="eyebrow">WELCOME TO YOUR SPORTS COMMUNITY</p>

          <h1>
            Play with Passion.
            <br />
            Grow with Teamwork.
          </h1>

          <p>Manage players and memberships in one place.</p>

          <a className="primary-button" href="#register">
            Register a Player →
          </a>
        </div>

        <div className="hero-ball">🏆</div>
      </section>

      <main className="container">
        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-icon">👥</span>
            <p>Total Players</p>
            <h2>{players.length}</h2>
          </article>

          <article className="stat-card">
            <span className="stat-icon">✅</span>
            <p>Active Members</p>
            <h2>{activeMembers}</h2>
          </article>

          <article className="stat-card">
            <span className="stat-icon">⚽</span>
            <p>Sports Categories</p>
            <h2>{totalSports}</h2>
          </article>
        </section>

        <section className="panel" id="register">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PLAYER MANAGEMENT</p>
              <h2>{editingId === null ? 'Register a Player' : 'Update Player'}</h2>
            </div>
          </div>

          <form className="player-form" onSubmit={handleSubmit}>
            <label>
              Player ID
              <input
                type="number"
                name="playerId"
                min="1"
                step="1"
                value={player.playerId}
                onChange={handleChange}
                disabled={editingId !== null}
                required
              />
            </label>

            <label>
              Full Name
              <input
                type="text"
                name="name"
                value={player.name}
                onChange={handleChange}
                minLength="2"
                required
              />
            </label>

            <label>
              Age
              <input
                type="number"
                name="age"
                min="1"
                max="120"
                value={player.age}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Sport
              <select
                name="sport"
                value={player.sport}
                onChange={handleChange}
                required
              >
                <option value="">Select sport</option>
                <option value="Cricket">Cricket</option>
                <option value="Football">Football</option>
                <option value="Badminton">Badminton</option>
                <option value="Basketball">Basketball</option>
                <option value="Tennis">Tennis</option>
                <option value="Volleyball">Volleyball</option>
              </select>
            </label>

            <label>
              Membership
              <select
                name="membershipType"
                value={player.membershipType}
                onChange={handleChange}
                required
              >
                <option value="Basic">Basic</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Premium">Premium</option>
              </select>
            </label>

            <label>
              Membership Status
              <select
                name="membershipStatus"
                value={player.membershipStatus}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>

            <div className="form-actions">
              <button className="primary-button" type="submit">
                {editingId === null ? 'Add Player' : 'Save Changes'}
              </button>

              {editingId !== null && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setPlayer({ ...emptyPlayer })
                    setEditingId(null)
                    setMessage('')
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {message && <p className="message">{message}</p>}
        </section>

        <section className="panel" id="players">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CLUB DIRECTORY</p>
              <h2>Registered Players</h2>
            </div>

            <span>{filteredPlayers.length} players</span>
          </div>

          <input
            className="search-input"
            type="search"
            placeholder="Search by ID, name, or sport..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Sport</th>
                  <th>Membership</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7">Loading players...</td>
                  </tr>
                ) : filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      {players.length === 0
                        ? 'No players registered yet.'
                        : 'No matching players found.'}
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map(item => (
                    <tr key={item._id || item.playerId}>
                      <td>{item.playerId}</td>
                      <td>{item.name}</td>
                      <td>{item.age}</td>
                      <td>{item.sport}</td>
                      <td>{item.membershipType || 'Basic'}</td>
                      <td>{item.membershipStatus || 'Active'}</td>
                      <td>
                        <button
                          className="edit-button"
                          type="button"
                          onClick={() => editPlayer(item)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          type="button"
                          onClick={() => deletePlayer(item.playerId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer>
        <strong>🏆 Sports Club Management System</strong>
        <p>Bringing players together through the spirit of sports.</p>
        <small>© 2026 Sports Club</small>
      </footer>
    </div>
  )
}

export default App

