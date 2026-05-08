import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Code2, Play, CheckCircle2, XCircle, Terminal, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CodingChallenge = () => {
  const [challenges, setChallenges] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const { data } = await axios.get('challenges');
        setChallenges(data);
        if (data.length > 0) {
          setCurrentChallenge(data[0]);
          setCode(data[0].boilerplate);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchChallenges();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setResults(null);
    try {
      const { data } = await axios.post(`challenges/${currentChallenge._id}/submit`, { code });
      setResults(data);
    } catch (err) {
      console.error(err);
      alert('Error submitting solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentChallenge) return null;

  return (
    <>
      <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)', background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '8px' }}>
            <Code2 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Challenge of the Day</h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>Earn {currentChallenge.points} pts</p>
          </div>
        </div>

        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{currentChallenge.title}</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '1.25rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {currentChallenge.description}
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700, borderRadius: '8px' }}
        >
          Solve Now
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card"
              style={{ width: '100%', maxWidth: '800px', height: '90vh', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              {/* Header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1117', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Terminal size={20} color="var(--primary)" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{currentChallenge.title}</h2>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>{currentChallenge.difficulty}</span>
                </div>
                <button onClick={() => setIsModalOpen(false)} style={{ color: 'white', opacity: 0.7 }}><XCircle size={24} /></button>
              </div>

              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.5fr', overflow: 'hidden' }}>
                {/* Left: Description */}
                <div style={{ padding: '1.5rem', borderRight: '1px solid var(--border)', overflowY: 'auto', background: '#f8fafc' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Description</h3>
                  <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, marginBottom: '2rem' }}>
                    {currentChallenge.description}
                  </p>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Test Cases</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {currentChallenge.testCases.map((test, idx) => (
                      <div key={idx} style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                        <p style={{ color: 'var(--text-light)', marginBottom: '0.25rem' }}>Input: <code style={{ color: 'var(--primary)' }}>{test.input}</code></p>
                        <p style={{ color: 'var(--text-light)' }}>Expected: <code style={{ color: '#059669' }}>{test.expected}</code></p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Editor */}
                <div style={{ display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#d4d4d4',
                        padding: '1.5rem',
                        fontFamily: 'monospace',
                        fontSize: '0.95rem',
                        resize: 'none',
                        outline: 'none',
                        lineHeight: 1.5
                      }}
                      spellCheck={false}
                    />
                  </div>

                  {/* Footer / Results */}
                  <div style={{ background: '#0d1117', borderTop: '1px solid #30363d', padding: '1rem' }}>
                    {results && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          {results.passed ? (
                            <><CheckCircle2 size={18} color="#10b981" /> <span style={{ color: '#10b981', fontWeight: 700 }}>All tests passed!</span></>
                          ) : (
                            <><XCircle size={18} color="#ef4444" /> <span style={{ color: '#ef4444', fontWeight: 700 }}>Some tests failed.</span></>
                          )}
                        </div>
                        <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {results.results.map((res, idx) => (
                            <div key={idx} style={{ padding: '4px 8px', borderRadius: '4px', background: res.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${res.passed ? '#10b981' : '#ef4444'}`, fontSize: '0.7rem', color: 'white' }}>
                              Test {idx + 1}: {res.passed ? 'PASS' : 'FAIL'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                      <button
                        className="btn btn-outline"
                        style={{ color: 'white', borderColor: '#30363d' }}
                        onClick={() => setCode(currentChallenge.boilerplate)}
                      >
                        Reset
                      </button>
                      <button
                        className="btn btn-primary"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        {isSubmitting ? 'Running...' : <><Play size={16} /> Run & Submit</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CodingChallenge;
