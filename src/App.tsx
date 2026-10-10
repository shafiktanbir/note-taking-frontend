import React, { useState, useEffect } from 'react';
import { api, getCurrentUser, removeAuthToken } from './services/api';

export function App() {
  const [user, setUser] = useState<any>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<'notes' | 'admin' | 'aggregations' | 'auth'>('auth');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auth Form State
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [interestsStr, setInterestsStr] = useState('chess, reading');

  // Notes State
  const [notes, setNotes] = useState<any[]>([]);
  const [notesPagination, setNotesPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Admin State
  const [users, setUsers] = useState<any[]>([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });

  // Aggregation State
  const [groupedInterests, setGroupedInterests] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [targetUserId, setTargetUserId] = useState('');

  useEffect(() => {
    if (user) {
      if (activeTab === 'auth') setActiveTab('notes');
      fetchNotes(1);
    }
  }, [user]);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Auth Actions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const interests = interestsStr.split(',').map((s) => s.trim()).filter(Boolean);
        const res = await api.register({ username, email, password, role, interests });
        setUser(res.data.user);
        showNotification('Registered successfully!');
      } else {
        const res = await api.login({ email, password });
        setUser(res.data.user);
        showNotification('Logged in successfully!');
      }
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setActiveTab('auth');
    showNotification('Logged out');
  };

  // Notes Actions
  const fetchNotes = async (page = 1) => {
    try {
      const res = await api.getNotes(page, notesPagination.limit);
      setNotes(res.data || []);
      if (res.pagination) {
        setNotesPagination(res.pagination);
      }
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createNote({ title: newTitle, content: newContent });
      setNewTitle('');
      setNewContent('');
      showNotification('Note created successfully!');
      fetchNotes(1);
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await api.deleteNote(id);
      showNotification('Note deleted.');
      fetchNotes(notesPagination.page);
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Admin Actions
  const fetchUsers = async (page = 1) => {
    try {
      const res = await api.getUsers(page, usersPagination.limit);
      setUsers(res.data || []);
      if (res.pagination) {
        setUsersPagination(res.pagination);
      }
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      showNotification('User deleted');
      fetchUsers(usersPagination.page);
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Aggregation Actions
  const fetchGroupedInterests = async () => {
    try {
      const res = await api.getGroupedInterests();
      setGroupedInterests(res.data || []);
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await api.getUserPosts(targetUserId.trim() || undefined);
      setUserPosts(res.data || []);
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  return (
    <div className="container">
      <header>
        <div className="brand">Secure Notes</div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>
              <strong>{user.username}</strong> ({user.email}){' '}
              <span className={`badge badge-${user.role}`}>{user.role}</span>
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>Not authenticated</span>
        )}
      </header>

      {/* Notifications */}
      {error && <div className="card" style={{ borderLeft: '4px solid var(--danger)', color: '#f87171' }}>{error}</div>}
      {successMsg && <div className="card" style={{ borderLeft: '4px solid var(--success)', color: '#34d399' }}>{successMsg}</div>}

      {/* Navigation Tabs */}
      <div className="nav-tabs" style={{ marginBottom: '1.5rem' }}>
        {!user && (
          <button className={`tab-btn ${activeTab === 'auth' ? 'active' : ''}`} onClick={() => setActiveTab('auth')}>
            Authentication
          </button>
        )}
        {user && (
          <>
            <button className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => { setActiveTab('notes'); fetchNotes(1); }}>
              My Notes
            </button>
            {user.role === 'admin' && (
              <button className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => { setActiveTab('admin'); fetchUsers(1); }}>
                Admin Console
              </button>
            )}
            <button className={`tab-btn ${activeTab === 'aggregations' ? 'active' : ''}`} onClick={() => { setActiveTab('aggregations'); fetchGroupedInterests(); fetchUserPosts(); }}>
              MongoDB Aggregations
            </button>
          </>
        )}
      </div>

      {/* TAB 1: AUTH */}
      {activeTab === 'auth' && (
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2>{isRegister ? 'Create Account' : 'Account Sign In'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {isRegister ? 'Register user or admin with interests.' : 'Enter credentials to access REST API.'}
          </p>

          <form onSubmit={handleAuthSubmit}>
            {isRegister && (
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {isRegister && (
              <>
                <div className="form-group">
                  <label>Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value as any)}>
                    <option value="user">Regular User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Interests (comma separated)</label>
                  <input type="text" value={interestsStr} onChange={(e) => setInterestsStr(e.target.value)} placeholder="chess, reading, coding" />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              {isRegister ? 'Register Account' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Already have an account? Log In' : 'Need an account? Register'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: NOTES DASHBOARD */}
      {activeTab === 'notes' && (
        <div>
          <div className="card">
            <h3>Create New Note</h3>
            <form onSubmit={handleCreateNote} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Enter note title..." required />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea rows={3} value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Enter note content..." required />
              </div>
              <button type="submit" className="btn btn-primary">Add Note</button>
            </form>
          </div>

          <h3 style={{ margin: '1.5rem 0 1rem 0' }}>Your Paginated Notes</h3>
          {notes.length === 0 ? (
            <div className="card" style={{ color: 'var(--text-muted)' }}>No notes found. Create your first note above!</div>
          ) : (
            notes.map((note) => (
              <div className="card" key={note._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4>{note.title}</h4>
                    <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>{note.content}</p>
                    <small style={{ color: 'var(--text-muted)' }}>
                      Created by {note.userId?.username || 'You'} at {new Date(note.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleDeleteNote(note._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Notes Pagination */}
          <div className="pagination card">
            <span>Page {notesPagination.page} of {notesPagination.totalPages} (Total: {notesPagination.total})</span>
            <div>
              <button
                className="btn btn-secondary"
                disabled={notesPagination.page <= 1}
                onClick={() => fetchNotes(notesPagination.page - 1)}
                style={{ marginRight: '0.5rem' }}
              >
                Previous
              </button>
              <button
                className="btn btn-secondary"
                disabled={notesPagination.page >= notesPagination.totalPages}
                onClick={() => fetchNotes(notesPagination.page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ADMIN CONSOLE */}
      {activeTab === 'admin' && (
        <div>
          <div className="card">
            <h3>Admin User Management</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              System user directory and role management.
            </p>
            {users.map((u) => (
              <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--card-border)' }}>
                <div>
                  <strong>{u.username}</strong> ({u.email}) <span className={`badge badge-${u.role}`}>{u.role}</span>
                  <div style={{ marginTop: '0.25rem' }}>
                    {u.interests?.map((i: string) => (
                      <span className="interest-pill" key={i}>{i}</span>
                    ))}
                  </div>
                </div>
                {u._id !== user.id && (
                  <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleDeleteUser(u._id)}>
                    Remove User
                  </button>
                )}
              </div>
            ))}

            <div className="pagination" style={{ marginTop: '1rem' }}>
              <span>Page {usersPagination.page} of {usersPagination.totalPages} (Total: {usersPagination.total})</span>
              <div>
                <button
                  className="btn btn-secondary"
                  disabled={usersPagination.page <= 1}
                  onClick={() => fetchUsers(usersPagination.page - 1)}
                  style={{ marginRight: '0.5rem' }}
                >
                  Previous
                </button>
                <button
                  className="btn btn-secondary"
                  disabled={usersPagination.page >= usersPagination.totalPages}
                  onClick={() => fetchUsers(usersPagination.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AGGREGATIONS */}
      {activeTab === 'aggregations' && (
        <div>
          {/* Scenario 1 */}
          <div className="card">
            <h3>User Interest Communities</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              User profiles grouped dynamically by shared interest topics.
            </p>

            <button className="btn btn-secondary" onClick={fetchGroupedInterests} style={{ marginBottom: '1rem' }}>
              Refresh Interests
            </button>

            <div className="grid-2">
              {groupedInterests.map((item) => (
                <div className="card" key={item._id} style={{ background: 'rgba(17, 24, 39, 0.9)' }}>
                  <h4 style={{ color: '#818cf8' }}>Interest: #{item._id}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Users Count: {item.userCount}</p>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                    {item.users?.map((u: any) => (
                      <li key={u.id}>{u.username} ({u.email})</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario 2 */}
          <div className="card">
            <h3>User Posts Feed</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Joined post history for users across the platform.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Optional User ID filter..."
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
              />
              <button className="btn btn-primary" onClick={fetchUserPosts}>
                Filter User Posts
              </button>
            </div>

            {userPosts.map((userDoc) => (
              <div className="card" key={userDoc._id} style={{ background: 'rgba(17, 24, 39, 0.9)' }}>
                <h4>User: {userDoc.username} ({userDoc.email})</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>User ID: {userDoc._id}</p>

                <h5 style={{ marginTop: '1rem', color: '#34d399' }}>Joined Posts ($lookup Array):</h5>
                {(!userDoc.posts || userDoc.posts.length === 0) ? (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No posts joined for this user.</p>
                ) : (
                  userDoc.posts.map((post: any) => (
                    <div key={post._id} style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(31, 41, 55, 0.6)', borderRadius: '6px' }}>
                      <strong>{post.title}</strong>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{post.body}</p>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
