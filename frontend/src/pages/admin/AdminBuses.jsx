import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '../../api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaBus, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa'

const busTypes = ['AC_SEATER','AC_SLEEPER','SLEEPER','SEMI_SLEEPER','SEATER','VOLVO','LUXURY']

export default function AdminBuses() {
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | bus object
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => { fetchBuses() }, [page])

  const fetchBuses = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getBuses(page, 15)
      const data = res.data.data
      setBuses(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch { toast.error('Failed to load buses') }
    finally { setLoading(false) }
  }

  const openAdd = () => { reset({}); setModal('add') }
  const openEdit = (bus) => { reset({ ...bus, busType: bus.busType }); setModal(bus) }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (modal === 'add') {
        await adminApi.createBus(data)
        toast.success('Bus created successfully!')
      } else {
        await adminApi.updateBus(modal.id, data)
        toast.success('Bus updated successfully!')
      }
      setModal(null)
      fetchBuses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save bus')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await adminApi.deleteBus(id)
      toast.success('Bus deactivated')
      fetchBuses()
    } catch { toast.error('Failed to delete bus') }
    finally { setDeleting(null) }
  }

  const filtered = buses.filter(b =>
    b.busName?.toLowerCase().includes(search.toLowerCase()) ||
    b.busNumber?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight">Bus Management</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Add, edit and manage your fleet</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 !py-2.5 !px-5 !text-sm">
          <FaPlus /> Add New Bus
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          placeholder="Search buses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10 text-sm"
        />
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Bus Name</th>
                <th>Bus Number</th>
                <th>Type</th>
                <th>Seats</th>
                <th>Operator</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="py-3"><div className="h-8 skeleton rounded" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500 font-semibold">No buses found</td></tr>
              ) : filtered.map(bus => (
                <tr key={bus.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                        <FaBus className="text-xs" />
                      </div>
                      <span className="font-medium text-slate-800 font-bold">{bus.busName}</span>
                    </div>
                  </td>
                  <td className="font-mono text-indigo-600 font-bold">{bus.busNumber}</td>
                  <td><span className="badge badge-info">{bus.busType?.replace('_', ' ')}</span></td>
                  <td className="text-slate-800 font-bold">{bus.totalSeats}</td>
                  <td className="text-slate-700 font-semibold">{bus.operatorName || '--'}</td>
                  <td>
                    <span className={`badge ${bus.active ? 'badge-success' : 'badge-danger'}`}>
                      {bus.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(bus)}
                        className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors">
                        <FaEdit className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleDelete(bus.id)}
                        disabled={deleting === bus.id}
                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors disabled:opacity-50">
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary !py-2 !px-4 !text-sm disabled:opacity-40">← Prev</button>
          <span className="flex items-center px-4 text-slate-600 text-sm font-bold">{page + 1}/{totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary !py-2 !px-4 !text-sm disabled:opacity-40">Next →</button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl text-slate-800">{modal === 'add' ? 'Add New Bus' : 'Edit Bus'}</h3>
                <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-650 transition-colors"><FaTimes /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Bus Name *</label>
                    <input className="input-field text-sm font-medium" placeholder="e.g. Rajdhani Express"
                      {...register('busName', { required: 'Required' })} />
                    {errors.busName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.busName.message}</p>}
                  </div>
                  <div>
                    <label className="input-label">Bus Number *</label>
                    <input className="input-field text-sm font-medium" placeholder="e.g. TN-01-AB-1234"
                      {...register('busNumber', { required: 'Required' })} />
                    {errors.busNumber && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.busNumber.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Bus Type *</label>
                    <select className="input-field text-sm font-medium" {...register('busType', { required: 'Required' })}>
                      <option value="">Select type</option>
                      {busTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                    {errors.busType && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.busType.message}</p>}
                  </div>
                  <div>
                    <label className="input-label">Total Seats *</label>
                    <input type="number" className="input-field text-sm font-medium" min={10} max={60}
                      {...register('totalSeats', { required: 'Required', min: 10, max: 60, valueAsNumber: true })} />
                    {errors.totalSeats && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.totalSeats.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="input-label">Operator Name</label>
                  <input className="input-field text-sm font-medium" placeholder="e.g. Express Travels"
                    {...register('operatorName')} />
                </div>

                <div>
                  <label className="input-label">Contact Number</label>
                  <input className="input-field text-sm font-medium" placeholder="e.g. 9876543210"
                    {...register('contactNumber')} />
                </div>

                <div>
                  <label className="input-label">Amenities (comma-separated)</label>
                  <input className="input-field text-sm font-medium" placeholder="e.g. AC,WiFi,USB,Water"
                    {...register('amenities')} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1 !py-2.5">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 !py-2.5">
                    {saving ? 'Saving...' : modal === 'add' ? 'Add Bus' : 'Update Bus'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
