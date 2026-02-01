import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:4000/api'

export default function App(){
  const [view, setView] = useState('dashboard')
  const [tickets, setTickets] = useState([])
  const [activities, setActivities] = useState([])
  const [report, setReport] = useState(null)
  const [detailedReport, setDetailedReport] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ customerName:'', email:'', phone:'', type:'Adult', price:50, ticketCategory:'Admission', rideId: '' })

  useEffect(()=>{ fetchAll() }, [])

  async function fetchAll(){
    setError('')
    try{
      const [t, a, r] = await Promise.all([
        axios.get(`${API}/tickets`),
        axios.get(`${API}/activities`),
        axios.get(`${API}/reports/daily`)
      ])
      setTickets(t.data)
      setActivities(a.data)
      // ensure compatibility: compute totalTickets if API returns countsByType or tickets
      const rep = r.data || {};
      let totalTickets = 0;
      if (Array.isArray(rep.tickets)) {
        totalTickets = rep.tickets.length;
      } else if (rep.countsByType) {
        totalTickets = Object.values(rep.countsByType).reduce((s,v)=>s+v, 0);
      } else if (rep.counts && rep.counts.total) {
        totalTickets = rep.counts.total;
      }
      setReport({ ...rep, totalTickets });
    }catch(err){
      console.error('fetchAll error', err)
      setError('Unable to load data — check server or network. ' + (err.response?.data?.error || err.message))
    }
  }

  useEffect(()=>{
    // suggest price based on category/type
    if (form.ticketCategory === 'Admission') {
      setForm(f => ({...f, price: form.type==='Child' ? 25 : form.type==='Senior' ? 35 : 50}))
    } else if (form.ticketCategory === 'AllRides') {
      setForm(f => ({...f, price: form.type==='Child' ? 45 : form.type==='Senior' ? 60 : 80}))
    } else if (form.ticketCategory === 'Ride') {
      setForm(f => ({...f, price: form.type==='Child' ? 10 : form.type==='Senior' ? 12 : 15}))
    }
    
  }, [form.ticketCategory, form.type])

  async function fetchDailyDetailed(){
    try{
      const res = await axios.get(`${API}/reports/daily`)
      setDetailedReport(res.data)
      setShowReport(true)
    }catch(err){
      console.error('daily report error', err)
      setError('Unable to fetch daily report: ' + (err.response?.data?.error || err.message))
    }
  }

  function exportReportCSV(){
    if(!detailedReport) return;
    const rows = [];
    rows.push(['ID','Customer','Category','Ride','Price','Issued']);
    detailedReport.tickets.forEach(t => {
      rows.push([t.id, t.customerName, t.ticketCategory, t.ride? t.ride.name : '', t.price, new Date(t.issuedAt).toISOString()]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${detailedReport.date || new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function submit(e){
    e.preventDefault()
    setError('')
    if (!form.customerName) return setError('Name is required')
    if (form.ticketCategory === 'Ride' && !form.rideId) return setError('Select a ride for Ride tickets')

    setLoading(true)
    try{
      const payload = { ...form, rideId: form.ticketCategory==='Ride' ? (form.rideId || null) : null }
      const res = await axios.post(`${API}/tickets`, payload)
      setTickets(t => [res.data, ...t])
      setShowForm(false)
      setForm({ customerName:'', email:'', phone:'', type:'Adult', price:50, ticketCategory:'Admission', rideId: '' })
    }catch(err){
      console.error('submit error', err)
      setError('Failed to create ticket: ' + (err.response?.data?.error || err.message))
    }
    setLoading(false)
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Amusent Park</div>
        <div className="menu">
          <button className={view==='dashboard'? 'active':''} onClick={()=>setView('dashboard')}>Dashboard</button>
          <button className={view==='tickets'? 'active':''} onClick={()=>setView('tickets')}>Tickets</button>
          <button className={view==='activities'? 'active':''} onClick={()=>setView('activities')}>Activities</button>
          <button onClick={()=>{setShowForm(true); setError('')}} className="btn">New Ticket</button>
        </div>
        <div className="footer">v1.0 • Admin</div>
      </aside>

      <main className="content">
        {error && (
          <div style={{marginBottom:12}} className="card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{color:'#ffdddd'}}>{error}</div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn ghost" onClick={()=>{ setError(''); fetchAll(); }}>Retry</button>
                <button className="btn" onClick={()=>setError('')}>Dismiss</button>
              </div>
            </div>
          </div>
        )}

        <div className="header">
          <div>
            <h1 style={{margin:0}}>Dashboard</h1>
            <div style={{color:'var(--muted)'}}>Overview of park activity</div>
          </div>
          <div className="search">
            <input className="input" placeholder="Search tickets or customers" />
            <button className="btn ghost" onClick={fetchDailyDetailed}>Daily Report</button>
          </div>
        </div>

        <div className="card-grid">
          <div className="card">
            <h3>Today's Revenue</h3>
            <div className="val">${report ? report.totalRevenue : '0'}</div>
          </div>
          <div className="card">
            <h3>Total Tickets</h3>
            <div className="val">{report ? (report.totalTickets || tickets.length) : tickets.length}</div>
          </div>
          <div className="card">
            <h3>Activities</h3>
            <div className="val">{activities.length}</div>
          </div>
        </div>

        {view==='dashboard' && (
          <>
            <section className="table" style={{marginBottom:20}}>
              <h3 style={{marginTop:0}}>Recent Tickets</h3>
              <table>
                <thead>
                  <tr><th>Customer</th><th>Type</th><th>Category</th><th>Ride</th><th>Price</th><th>Issued</th></tr>
                </thead>
                <tbody>
                  {tickets.slice(0,8).map(t=> (
                    <tr key={t.id}><td>{t.customerName}</td><td>{t.type}</td><td>{t.ticketCategory}</td><td>{t.ride? t.ride.name : '-'}</td><td>${t.price}</td><td>{new Date(t.issuedAt).toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
              <div className="card">
                <h3>Activity Usage</h3>
                <div style={{color:'var(--muted)'}}>Currently available activities and capacities</div>
                <ul>
                  {activities.map(a=> <li key={a.id}>{a.name} — cap: {a.capacity} — {a.durationMinutes}min</li>)}
                </ul>
              </div>

              <div className="card">
                <h3>Quick Actions</h3>
                <div className="actions" style={{marginTop:12}}>
                  <button className="btn" onClick={()=>{setShowForm(true); setError('')}}>New Ticket</button>
                  <button className="btn ghost" onClick={fetchDailyDetailed}>Daily Report</button>
                </div>
              </div>
            </section>
          </>
        )}

        {view==='tickets' && (
          <section className="table">
            <h3 style={{marginTop:0}}>All Tickets</h3>
            <table>
              <thead><tr><th>ID</th><th>Customer</th><th>Type</th><th>Category</th><th>Ride</th><th>Price</th><th>Issued</th></tr></thead>
              <tbody>
                {tickets.map(t=> <tr key={t.id}><td>{t.id}</td><td>{t.customerName}</td><td>{t.type}</td><td>{t.ticketCategory}</td><td>{t.ride? t.ride.name:'-'}</td><td>${t.price}</td><td>{new Date(t.issuedAt).toLocaleString()}</td></tr>)}
              </tbody>
            </table>
          </section>
        )}

        {view==='activities' && (
          <section className="card">
            <h3>Activities</h3>
            <ul>
              {activities.map(a=> <li key={a.id}>{a.name} — {a.description} — cap {a.capacity}</li>)}
            </ul>
          </section>
        )}

      </main>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-panel" role="dialog" aria-modal="true">
            <button className="modal-close" onClick={()=>setShowForm(false)}>&times;</button>
            <h3 style={{marginTop:0}}>Print Ticket</h3>
            <form className="modal-grid" onSubmit={submit}>
              <div className="modal-left">
                {error && <div className="error">{error}</div>}
                <div>
                  <div className="label">Name</div>
                  <input placeholder="Full name" required value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})} />
                </div>
                <div style={{display:'flex',gap:8,marginTop:8}}>
                  <div style={{flex:1}}>
                    <div className="label">Email</div>
                    <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
                  </div>
                  <div style={{flex:1}}>
                    <div className="label">Phone</div>
                    <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
                  </div>
                </div>

                <div style={{marginTop:12}}>
                  <div className="label">Notes</div>
                  <input placeholder="Any notes (optional)" />
                </div>
              </div>

              <div className="modal-right">
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <div style={{flex:1}}>
                    <div className="label">Ticket Type</div>
                    <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                      <option>Adult</option>
                      <option>Child</option>
                      <option>Senior</option>
                    </select>
                  </div>
                  <div style={{width:12}} />
                  <div style={{flex:1}}>
                    <div className="label">Category</div>
                    <select value={form.ticketCategory} onChange={e=>{ setForm({...form,ticketCategory:e.target.value}); setError('') }}>
                      <option value="Admission">Admission</option>
                      <option value="Ride">Ride</option>
                      <option value="AllRides">All Rides</option>
                    </select>
                  </div>
                </div>

                {form.ticketCategory==='Ride' && (
                  <div style={{marginTop:12}}>
                    <div className="label">Choose Ride</div>
                    <div className="rides-grid">
                      {activities.map(a=> (
                        <div key={a.id} className={"ride-card " + (String(form.rideId)===String(a.id) ? 'selected':'')} onClick={()=>setForm({...form,rideId:a.id})}>
                          <div className="ride-thumb">{a.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700}}>{a.name}</div>
                            <div style={{color:'var(--muted)',fontSize:13}}>{a.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{marginTop:12}}>
                  <div className="label">Price</div>
                  <div className="price-display">${form.price}</div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn ghost" onClick={()=>setShowForm(false)}>Cancel</button>
                  <button className="btn" disabled={loading}>{loading? 'Processing...' : 'Print Ticket'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReport && detailedReport && (
        <div className="report-overlay" role="dialog" aria-modal="true">
          <div className="report-panel">
            <div className="report-header">
              <div>
                <h2 style={{margin:0}}>Daily Report</h2>
                <div style={{color:'var(--muted)'}}>{detailedReport.date}</div>
              </div>
              <div className="report-actions">
                <button className="btn ghost" onClick={exportReportCSV}>Export CSV</button>
                <button className="btn ghost" onClick={()=>setShowReport(false)}>Close</button>
              </div>
            </div>

            <div className="report-metrics-grid">
              <div className="metric-card"><h3>Revenue</h3><div className="val">${detailedReport.totalRevenue}</div></div>
              <div className="metric-card"><h3>Tickets</h3><div className="val">{detailedReport.tickets.length}</div></div>
              <div className="metric-card"><h3>Top Ride</h3><div className="val">{detailedReport.topRide? detailedReport.topRide.name : '—'}</div></div>
            </div>

            <div className="report-grid">
              <div className="card">
                <h3>Rides Taken</h3>
                <ul>
                  {detailedReport.ridesTaken.length ? detailedReport.ridesTaken.map(r=> <li key={r.id}>{r.name} — {r.count} rides</li>) : <li>None</li>}
                </ul>
              </div>

              <div className="card">
                <h3>Breakdown</h3>
                <div style={{color:'var(--muted)'}}>By Type</div>
                <ul>
                  {Object.entries(detailedReport.countsByType).map(([k,v])=> <li key={k}>{k}: {v}</li>)}
                </ul>
                <div style={{color:'var(--muted)', marginTop:8}}>By Category</div>
                <ul>
                  {Object.entries(detailedReport.countsByCategory).map(([k,v])=> <li key={k}>{k}: {v}</li>)}
                </ul>
              </div>
            </div>

            <div className="card report-table" style={{marginTop:12}}>
              <h3>Tickets Detail</h3>
              <table>
                <thead><tr><th>ID</th><th>Customer</th><th>Category</th><th>Ride</th><th>Price</th><th>Issued</th></tr></thead>
                <tbody>
                  {detailedReport.tickets.map(t=> (
                    <tr key={t.id}><td>{t.id}</td><td>{t.customerName}</td><td>{t.ticketCategory}</td><td>{t.ride? t.ride.name:'-'}</td><td>${t.price}</td><td>{new Date(t.issuedAt).toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
