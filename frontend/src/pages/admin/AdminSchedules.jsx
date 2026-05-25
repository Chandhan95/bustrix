import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '../../api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaCalendarAlt, FaPlus, FaTimes } from 'react-icons/fa'

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState([])
  const [buses, setBuses] = useState([])
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => { fetchAll() }, [page])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [schedRes, busRes, routeRes] = await Promise.all([
        adminApi.getSchedules(page, 15),
        adminApi.getBuses(0, 100),
        adminApi.getRoutes(),
      ])
      const data = schedRes.data.data
      setSchedules(data.content || [])
      setTotalPages(data.totalPages || 0)
      setBuses(busRes.data.data?.content || [])
      setRoutes(routeRes.data.data || [])
    } catch { toast.error('Failed to load schedules') }
    finally { setLoading(false) }
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await adminApi.createSchedule(data)
      toast.success('Schedule created!')
      setModal(false)
      reset({})
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create schedule')
    } finally { setSaving(false) }
  }

  const fmtTime = (t) => {
    if (!t) return '--'
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight">Schedule Management</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Create and manage bus schedules</p>
        </div>
        <button onClick={() => { reset({}); setModal(true) }} className="btn-primary flex items-center gap-2 !py-2.5 !px-5 !text-sm">
          <FaPlus /> Add Schedule
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Bus</th>
                <th>Route</th>
                <th>Date</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Price/Seat</th>
                <th>Available</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={8}><div className="h-8 skeleton rounded m-2" /></td></tr>
                ))
              ) : schedules.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-500 font-semibold">No schedules found</td></tr>
              ) : schedules.map(s => (
                <tr key={s.id}>
                  <td className="font-medium text-slate-800 font-bold text-xs">{s.bus?.busName}<br /><span className="text-slate-500 font-mono">{s.bus?.busNumber}</span></td>
                  <td className="text-slate-700 text-xs font-semibold">{s.route?.source} → {s.route?.destination}</td>
                  <td className="text-slate-700 font-semibold">{s.travelDate}</td>
                  <td className="text-slate-800 font-bold">{fmtTime(s.departureTime)}</td>
                  <td className="text-slate-800 font-bold">{fmtTime(s.arrivalTime)}</td>
                  <td className="text-emerald-600 font-bold font-semibold">₹{Number(s.pricePerSeat).toLocaleString()}</td>
                  <td className="text-slate-800 font-bold">{s.availableSeats}</td>
                  <td><span className={`badge ${s.status === 'SCHEDULED' ? 'badge-success' : s.status === 'CANCELLED' ? 'badge-danger' : 'badge-info'}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary !py-2 !px-4 !text-sm disabled:opacity-40">← Prev</button>
          <span className="flex items-center px-4 text-slate-600 text-sm font-bold">{page + 1}/{totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary !py-2 !px-4 !text-sm disabled:opacity-40">Next →</button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-xl text-slate-800 font-bold">Create Schedule</h3>
                <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-655 hover:text-slate-700 transition-colors"><FaTimes /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="input-label">Bus *</label>
                  <select className="input-field text-sm font-medium" {...register('busId', { required: 'Required', valueAsNumber: true })}>
                    <option value="">Select bus</option>
                    {buses.map(b => <option key={b.id} value={b.id}>{b.busName} ({b.busNumber})</option>)}
                  </select>
                  {errors.busId && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.busId.message}</p>}
                </div>

                <div>
                  <label className="input-label">Route *</label>
                  <select className="input-field text-sm font-medium" {...register('routeId', { required: 'Required', valueAsNumber: true })}>
                    <option value="">Select route</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.source} → {r.destination}</option>)}
                  </select>
                  {errors.routeId && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.routeId.message}</p>}
                </div>

                <div>
                  <label className="input-label">Travel Date *</label>
                  <input type="date" min={today} className="input-field text-sm font-medium" {...register('travelDate', { required: 'Required' })} />
                  {errors.travelDate && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.travelDate.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Departure Time *</label>
                    <input type="time" className="input-field text-sm font-medium" {...register('departureTime', { required: 'Required' })} />
                  </div>
                  <div>
                    <label className="input-label">Arrival Time *</label>
                    <input type="time" className="input-field text-sm font-medium" {...register('arrivalTime', { required: 'Required' })} />
                  </div>
                </div>

                <div>
                  <label className="input-label">Price Per Seat (₹) *</label>
                  <input type="number" min="1" step="0.01" className="input-field text-sm font-medium" placeholder="e.g. 499"
                    {...register('pricePerSeat', { required: 'Required', min: { value: 1, message: 'Must be positive' }, valueAsNumber: true })} />
                  {errors.pricePerSeat && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.pricePerSeat.message}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 !py-2.5">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 !py-2.5">{saving ? 'Creating...' : 'Create Schedule'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
