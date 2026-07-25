// src/screens/settings/SettingsVotingScreen.jsx
import { useState, useEffect } from 'react'

const API         = 'https://bgyfpy-backend.onrender.com'
const GOLD        = '#D4A843'
const GOLD_DIM    = 'rgba(212,168,67,0.15)'
const GOLD_BORDER = 'rgba(212,168,67,0.3)'
const BG_CARD     = '#1e1e1e'
const TEXT_1      = '#F0E6CC'
const TEXT_2      = '#A89060'
const TEXT_3      = '#5A4828'
const GREEN       = '#5DBF6A'
const RED         = '#CF5F5F'


function ProposalCard({ proposal, onVote, voted, myVote }) {
  const vs     = proposal.vote_summary || {}
  const total  = vs.total_voted || 0
  const needed = vs.threshold || 6
  const pct    = total > 0 ? (vs.approve / total) * 100 : 0

  return (
    <div style={{ background:BG_CARD, borderRadius:12,
      border:`0.5px solid ${GOLD_BORDER}`,
      margin:'0 14px 12px', overflow:'hidden' }}>

      {/* Proposal content */}
      <div style={{ padding:'12px 14px' }}>
        <div style={{ fontSize:13, fontWeight:500, color:TEXT_1, marginBottom:4 }}>
          {proposal.title}
        </div>
        <div style={{ fontSize:11, color:TEXT_2, lineHeight:1.6, marginBottom:8 }}>
          {proposal.description}
        </div>
        <div style={{ fontSize:9, color:TEXT_3 }}>
          Submitted by {proposal.submitted_by} · {proposal.created_at?.slice(0,10)}
        </div>
      </div>

      {/* Attachment */}
      {proposal.attachment_url && (
        <img src={proposal.attachment_url} alt="Attachment"
          style={{ width:'100%', maxHeight:160, objectFit:'cover' }}/>
      )}

      {/* Vote progress */}
      <div style={{ padding:'10px 14px',
        borderTop:`0.5px solid rgba(212,168,67,0.08)` }}>
        <div style={{ display:'flex', justifyContent:'space-between',
          fontSize:9, color:TEXT_3, marginBottom:6 }}>
          <span>{vs.approve||0} approve · {vs.reject||0} reject · {vs.pending||0} pending</span>
          <span>Need {needed} to pass</span>
        </div>
        <div style={{ height:4, borderRadius:2,
          background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
          <div style={{ height:'100%', borderRadius:2, background:GREEN,
            width:`${pct}%`, transition:'width 0.3s' }}/>
        </div>
      </div>

      {/* Vote buttons or result */}
      <div style={{ padding:'10px 14px',
        borderTop:`0.5px solid rgba(212,168,67,0.08)` }}>
        {voted ? (
          <div style={{ display:'flex', alignItems:'center', gap:8,
            fontSize:11, color:myVote==='approve'?GREEN:RED }}>
            <span>{myVote==='approve'?'✓':'✗'}</span>
            <span>You voted {myVote}</span>
          </div>
        ) : (
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => onVote(proposal.id, 'approve')}
              style={{ flex:1, padding:'10px', borderRadius:10, border:'none',
                cursor:'pointer', background:'rgba(93,191,106,0.12)',
                border:`1px solid rgba(93,191,106,0.3)`,
                fontSize:12, fontWeight:600, color:GREEN }}>
              ✓ Approve
            </button>
            <button onClick={() => onVote(proposal.id, 'reject')}
              style={{ flex:1, padding:'10px', borderRadius:10, border:'none',
                cursor:'pointer', background:'rgba(207,95,95,0.12)',
                border:`1px solid rgba(207,95,95,0.3)`,
                fontSize:12, fontWeight:600, color:RED }}>
              ✗ Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ClosedProposalCard({ proposal }) {
  const vs     = proposal.vote_summary || {}
  const passed = proposal.status === 'passed'

  return (
    <div style={{ background:BG_CARD, borderRadius:12,
      border:`0.5px solid ${passed?'rgba(93,191,106,0.25)':'rgba(207,95,95,0.2)'}`,
      margin:'0 14px 10px', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'flex-start',
        justifyContent:'space-between', padding:'12px 14px' }}>
        <div style={{ flex:1, minWidth:0, paddingRight:12 }}>
          <div style={{ fontSize:13, fontWeight:500, color:TEXT_1, marginBottom:3 }}>
            {proposal.title}
          </div>
          <div style={{ fontSize:10, color:TEXT_3 }}>
            {vs.approve||0}–{vs.reject||0} · {proposal.closed_at?.slice(0,10)}
          </div>
        </div>
        <div style={{ flexShrink:0, padding:'3px 10px', borderRadius:14,
          fontSize:10, fontWeight:600,
          background:passed?'rgba(93,191,106,0.12)':'rgba(207,95,95,0.1)',
          border:`0.5px solid ${passed?'rgba(93,191,106,0.3)':'rgba(207,95,95,0.25)'}`,
          color:passed?GREEN:RED }}>
          {passed?'PASSED':'REJECTED'}
        </div>
      </div>
    </div>
  )
}

export default function SettingsVotingScreen({ onBack, currentUser }) {
  const [user, setUser] = useState(currentUser)

  const [tab,        setTab]      = useState('open')
  const [proposals,  setProposals]= useState([])
  const [loading,    setLoading]  = useState(false)
  const [myVotes,    setMyVotes]  = useState({}) // id → vote
  const [voting,     setVoting]   = useState(null)

  const loadProposals = () => {
    setLoading(true)
    Promise.all([
      fetch(`${API}/settings/proposals?status=open`).then(r=>r.json()),
      fetch(`${API}/settings/proposals?status=passed`).then(r=>r.json()),
      fetch(`${API}/settings/proposals?status=rejected`).then(r=>r.json()),
    ]).then(([open, passed, rejected]) => {
      const all = [
        ...(open.proposals||[]),
        ...(passed.proposals||[]),
        ...(rejected.proposals||[]),
      ]
      setProposals(all)

      // Build my votes map from vote data
      const votes = {}
      all.forEach(p => {
        const myV = (p.votes||[]).find(v => v.manager_id === user.manager_id)
        if (myV) votes[p.id] = myV.vote
      })
      setMyVotes(votes)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { loadProposals() }, [])

  const handleVote = async (proposalId, vote) => {
    setVoting(proposalId)
    try {
      await fetch(`${API}/settings/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ manager_id:user.manager_id, vote })
      })
      setMyVotes(prev => ({...prev, [proposalId]:vote}))
      loadProposals() // refresh to get updated counts
    } catch(e) { console.error(e) }
    finally { setVoting(null) }
  }

  // Open = proposals where I haven't voted yet, sorted oldest first
  const openToVote = proposals
    .filter(p => p.status === 'open' && !myVotes[p.id])
    .sort((a,b) => a.created_at?.localeCompare(b.created_at))

  // Closed = proposals I've voted on OR that are passed/rejected
  const closed = proposals
    .filter(p => p.status !== 'open' || myVotes[p.id])
    .sort((a,b) => (b.closed_at||b.created_at)?.localeCompare(a.closed_at||a.created_at))

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column',
      background:'#0f0f0f', overflowY:'auto' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12,
        padding:'14px 16px', borderBottom:`0.5px solid ${GOLD_BORDER}`,
        background:'#171717', flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none',
          color:TEXT_2, fontSize:22, cursor:'pointer', padding:'0 4px' }}>‹</button>
        <div style={{ fontSize:13, fontWeight:500, color:GOLD, letterSpacing:'0.08em' }}>
          VOTING
        </div>
      </div>

      {/* Toggle */}
      <div style={{ display:'flex', margin:'12px 14px 0', background:BG_CARD,
        borderRadius:10, border:`0.5px solid ${GOLD_BORDER}`, padding:3, gap:3 }}>
        {[{k:'open',label:'Open Proposals'},{k:'closed',label:'Closed Proposals'}].map(o => (
          <button key={o.k} onClick={() => setTab(o.k)}
            style={{ flex:1, padding:'8px 4px', borderRadius:8, border:'none',
              cursor:'pointer',
              background:tab===o.k?GOLD_DIM:'transparent',
              borderWidth:tab===o.k?1:0, borderStyle:'solid',
              borderColor:tab===o.k?GOLD:'transparent',
              fontSize:10, letterSpacing:'0.06em', textTransform:'uppercase',
              color:tab===o.k?GOLD:TEXT_3, fontWeight:tab===o.k?600:400 }}>
            {o.label}
            {o.k==='open' && openToVote.length > 0 && (
              <span style={{ marginLeft:6, background:RED, color:'white',
                borderRadius:10, padding:'1px 6px', fontSize:8 }}>
                {openToVote.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ paddingTop:12, paddingBottom:32 }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>
            Loading…
          </div>
        ) : tab === 'open' ? (
          openToVote.length === 0 ? (
            <div style={{ padding:40, textAlign:'center' }}>
              <div style={{ fontSize:24, marginBottom:8 }}>✓</div>
              <div style={{ fontSize:13, color:GREEN }}>All caught up!</div>
              <div style={{ fontSize:11, color:TEXT_3, marginTop:4 }}>
                No open proposals need your vote.
              </div>
            </div>
          ) : openToVote.map(p => (
            <ProposalCard
              key={p.id} proposal={p}
              onVote={handleVote}
              voted={!!myVotes[p.id]}
              myVote={myVotes[p.id]}/>
          ))
        ) : (
          closed.length === 0 ? (
            <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>
              No closed proposals yet.
            </div>
          ) : closed.map(p => (
            <ClosedProposalCard key={p.id} proposal={p}/>
          ))
        )}
      </div>
    </div>
  )
}