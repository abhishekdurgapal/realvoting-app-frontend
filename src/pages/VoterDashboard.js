import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import guestIcon from "../pages/guest-icon.png"; // adjust path if different

export default function VoterDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [results, setResults] = useState([]);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

  // fetch candidate list
  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${API}/candidate/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (res.ok) setCandidates(data);
      else console.warn("fetchCandidates:", data);
    } catch (err) {
      console.error("fetchCandidates error", err);
    }
  };

  // fetch aggregated results
  const fetchResults = async () => {
    try {
      const res = await fetch(`${API}/candidate/vote/count`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (res.ok) setResults(data);
      else console.warn("fetchResults:", data);
    } catch (err) {
      console.error("fetchResults error", err);
    }
  };

  // fetch profile to know if user already voted
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/user/profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (res.ok && data.user) {
        // support both isVoted and is_voted
        const isVoted = Boolean(data.user.isVoted ?? data.user.is_voted ?? false);
        setVoted(isVoted);
        return data.user;
      }
    } catch (err) {
      console.error("fetchProfile error", err);
    }
    return null;
  };

  // initial load
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCandidates(), fetchResults(), fetchProfile()]);
      setLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  // vote handler
  const vote = async (candidate) => {
    const id = candidate.id ?? candidate._id;
    if (!id) {
      alert("Invalid candidate id");
      return;
    }

    try {
      const res = await fetch(`${API}/candidate/vote/${id}`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Vote cast successfully!");
        setVoted(true);
        await fetchResults(); // refresh live results
      } else {
        alert(data.message || data.error || "Vote failed");
      }
    } catch (err) {
      console.error("vote error", err);
      alert("Vote failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  // compute totals for the results display
  const totalVotes = results.reduce((sum, it) => {
    const v = it.votes ?? it.voteCount ?? it.vote_count ?? 0;
    return sum + (typeof v === "number" ? v : Number(v) || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-pink-400 text-gray-800 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text--600">📺 Fan Voting Dashboard</h1>

      {voted ? (
        <>
          <p className="text-center text--600 font-semibold mb-4">✅ You have voted.</p>
          <h2 className="text-2xl font-bold text--600 mb-4 text-center">Live Results</h2>

          {results.length > 0 ? (
            <div className="max-w-xl mx-auto space-y-4">
              {results.map((r, i) => {
                const votes = r.votes ?? r.voteCount ?? r.vote_count ?? 0;
                const percent = totalVotes ? (votes / totalVotes) * 100 : 0;
                return (
                  <div key={r.id ?? i} className="bg-white p-4 rounded-xl shadow">
                    <p className="font-bold text-lg">{r.candidate ?? r.name ?? r.party} — {votes} votes</p>
                    <div className="w-full bg-gray-200 rounded h-4 mt-2">
                      <div
                        className="bg-lime-500 h-4 rounded"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{percent.toFixed(1)}%</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center">No results yet.</p>
          )}
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-purple-500 mb-4 text-center">Vote for Your Favorite</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {candidates.map((c, i) => (
              <div key={c.id ?? c._id ?? i} className="bg-white text-black rounded-2xl p-4 shadow-xl relative">
                <img
                  src={guestIcon}
                  alt="Guest Icon"
                  className="w-20 h-20 absolute top-2 right-2"
                />
                {c.image && (
                  <img src={c.image} alt={c.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                )}
                <p className="text-xl font-bold text-purple-700">{c.name}</p>
                <p className="mb-4 text-gray-600">{c.party}</p>
                <button
                  onClick={() => vote(c)}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  Vote
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
