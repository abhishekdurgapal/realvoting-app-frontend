import React, { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [results, setResults] = useState([]);
  const [voters, setVoters] = useState([]);
  const [error, setError] = useState('');
  const [candidate, setCandidate] = useState({ name: '', party: '', age: '' });
  const token = localStorage.getItem('token');
  const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  const fetchResults = async () => {
    try {
      const res = await fetch(`${API}/candidate/vote/count`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (res.ok) setResults(data);
      else setError(data.error || data.message || 'Failed to fetch results');
    } catch (err) {
      setError('Error fetching results');
      console.error(err);
    }
  };

  const fetchVoters = async () => {
    try {
      const res = await fetch(`${API}/user/users/voters`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (res.ok) setVoters(data);
      else setError(data.error || data.message || 'Failed to fetch voters');
    } catch (err) {
      setError('Error fetching voters');
      console.error(err);
    }
  };

  useEffect(() => {
    // Always try to load results and voters when component mounts or token changes.
    fetchResults();
    fetchVoters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(candidate),
      });

      const data = await res.json();
      if (res.ok) {
        setCandidate({ name: '', party: '', age: '' });
        await fetchResults();
        alert('Candidate added successfully');
      } else {
        alert(data.message || data.error || 'Failed to add candidate');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding candidate');
    }
  };

  const resetVotes = async () => {
    try {
      const res = await fetch(`${API}/user/admin/reset`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert('Voting has been reset successfully');
        await fetchResults();
        await fetchVoters();
      } else {
        alert(data.message || data.error || 'Failed to reset voting');
      }
    } catch (err) {
      console.error(err);
      alert('Error resetting voting');
    }
  };

  // compute total votes once
  const totalVotes = results.reduce((sum, it) => {
    const v = it.votes ?? it.voteCount ?? it.vote_count ?? 0;
    return sum + (typeof v === 'number' ? v : Number(v) || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-400 p-6 text-white">
      <div className="max-w-4xl mx-auto bg-white text-gray-800 rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4 text-center text-purple-700">Admin Dashboard</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Add Candidate Form */}
        <form onSubmit={handleCandidateSubmit} className="mb-6 space-y-2">
          <h2 className="text-2xl font-semibold text-purple-600">Add Candidate</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Position"
              value={candidate.name}
              onChange={(e) => setCandidate({ ...candidate, name: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Candidate Name"
              value={candidate.party}
              onChange={(e) => setCandidate({ ...candidate, party: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Age"
              value={candidate.age}
              onChange={(e) => setCandidate({ ...candidate, age: e.target.value })}
              className="border p-2 rounded"
              required
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700">
            Add Candidate
          </button>
        </form>

        {/* Reset Voting */}
        <div className="mb-6">
          <button
            onClick={resetVotes}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reset Voting
          </button>
        </div>

        {/* Voting Results */}
        <h2 className="text-2xl font-semibold text-purple-600 mb-2">Results:</h2>
        {results.length > 0 ? (
          results.map((r, i) => {
            const votes = r.votes ?? r.voteCount ?? r.vote_count ?? 0;
            const percentage = totalVotes ? (votes / totalVotes) * 100 : 0;

            return (
              <div key={r.id ?? i} className="mb-4">
                <p className="font-semibold">{r.candidate || r.name || r.party}: {votes} votes</p>
                <div className="w-full bg-gray-300 rounded h-4">
                  <div
                    className="bg-blue-500 h-4 rounded"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">No results yet.</p>
        )}

        {/* Voter List */}
        <h2 className="text-2xl font-semibold text-purple-600 mt-6 mb-2">Voters:</h2>
        {voters.length > 0 ? (
          voters.map((v, i) => {
            // support both isVoted and is_voted field names
           const voted =
  v.isVoted !== undefined
    ? v.isVoted
    : v.is_voted !== undefined
    ? Boolean(v.is_voted)
    : false;

            return (
              <p key={v.id ?? i} className="text-sm text-gray-700">
                {v.name} - Email: {v.email} - Voted: {voted ? 'Yes' : 'No'}
              </p>
            );
          })
        ) : (
          <p className="text-gray-500">No voter data available.</p>
        )}
      </div>
    </div>
  );
}
