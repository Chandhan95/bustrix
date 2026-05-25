import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminApi } from '../../api'
import toast from 'react-hot-toast'
import { FaUsers, FaSearch, FaToggleOn, FaToggleOff, FaShieldAlt } from 'react-icons/fa'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => { fetchUsers() }, [page, search])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getUsers(page, 20, search)
      const data = res.data.data
      setUsers(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  const toggleStatus = async (id) => {
    try {
      await adminApi.toggleUserStatus(id)
      toast.success('User status updated')
      fetchUsers()
    } catch { toast.error('Failed') }
  }

  const makeAdmin = async (id) => {
    if (!confirm('Make this user an ADMIN?')) return
    try {
      await adminApi.updateUserRole(id, 'ADMIN')
      toast.success('User promoted to Admin')
      fetchUsers()
    } catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight">User Management</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Manage registered users and roles</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          placeholder="Search users..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          className="input-field pl-10 text-sm"
        />
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7}><div className="h-8 skeleton rounded m-2" /></td></tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500 font-semibold">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0 border border-indigo-200">
                        {u.firstName?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800 font-bold">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="text-slate-700 text-xs font-semibold">{u.email}</td>
                  <td className="text-slate-700 font-semibold">{u.phone || '--'}</td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-info'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.enabled ? 'badge-success' : 'badge-danger'}`}>
                      {u.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="text-slate-500 text-xs font-semibold">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '--'}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(u.id)}
                        title={u.enabled ? 'Disable user' : 'Enable user'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          u.enabled
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        }`}
                      >
                        {u.enabled ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => makeAdmin(u.id)}
                          title="Promote to Admin"
                          className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center justify-center transition-colors border border-amber-200/50"
                        >
                          <FaShieldAlt className="text-xs" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary !py-2 !px-4 !text-sm disabled:opacity-40">← Prev</button>
          <span className="flex items-center px-4 text-slate-650 text-sm font-bold">{page + 1}/{totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary !py-2 !px-4 !text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}
