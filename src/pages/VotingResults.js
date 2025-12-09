import React, { useEffect, useState } from 'react';

export default function VotingResults() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`${API}/candidate/vote/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setResults(data);
        else setError(data.error || 'Failed to fetch results');
      } catch (err) {
        setError('Error fetching results');
        console.error(err);
      }
    };

    fetchResults();
  }, [token]);

  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Live Voting Results</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {results.length > 0 ? (
        results.map((r, i) => {
          const percent = totalVotes ? (r.votes / totalVotes) * 100 : 0;

          return (
            <div key={i} className="mb-4">
              <p className="font-semibold">{r.party}: {r.votes} votes</p>
              <div className="w-full bg-gray-200 rounded h-4">
                <div
                  className="bg-blue-600 h-4 rounded"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{percent.toFixed(1)}%</p>
            </div>
          );
        })
      ) : (
        <p>No results available yet.</p>
      )}
    </div>
  );
}
