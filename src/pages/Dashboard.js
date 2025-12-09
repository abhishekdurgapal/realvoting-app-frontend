import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VoterDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchCandidates();
  }, [token]);

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${API}/candidate/vote/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCandidates(data);
      else setError(data.message || 'Failed to load candidates');
    } catch (err) {
      console.error(err);
      setError('Error fetching candidates');
    }
  };

  const vote = async (candidate) => {
    try {
      const res = await fetch(`${API}/candidate/vote/${candidate._id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Vote cast successfully!');
        setVoted(true);
        fetchCandidates(); // Refresh to show updated votes
      } else {
        alert(data.message || 'Vote failed');
      }
    } catch (err) {
      console.error(err);
      alert('Vote failed');
    }
  };

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vote for Your Candidate</h1>

      {error && <p className="text-red-500">{error}</p>}

      {candidates.length > 0 ? (
        candidates.map((c, i) => {
          const percent = totalVotes ? (c.votes / totalVotes) * 100 : 0;

          return (
            <div key={i} className="border p-4 rounded mb-4 shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p><strong>Name:</strong> {c.name}</p>
                  <p><strong>Party:</strong> {c.party}</p>
                </div>
                {!voted && (
                  <button
                    onClick={() => vote(c)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Vote
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-4 bg-gray-200 rounded">
                  <div
                    className="h-4 bg-green-500 rounded"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{percent.toFixed(1)}%</p>
              </div>
            </div>
          );
        })
      ) : (
        <p>No candidates available.</p>
      )}
    </div>
  );
}
