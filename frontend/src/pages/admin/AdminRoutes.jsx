import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '../../api'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaRoute, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa'
import CityAutocomplete from '../../components/common/CityAutocomplete'

export default function AdminRoutes() {
  const [routes, setRoutes] = useState([])
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [createSchedule, setCreateSchedule] = useState(false)
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm()

  useEffect(() => { 
    fetchRoutes()
    fetchBuses()
  }, [])

  const fetchRoutes = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getRoutes()
      setRoutes(res.data.data || [])
    } catch { toast.error('Failed to load routes') }
    finally { setLoading(false) }
  }

  const fetchBuses = async () => {
    try {
      const res = await adminApi.getBuses(0, 100)
      setBuses(res.data.data?.content || [])
    } catch {}
  }

  const openAdd = () => { reset({}); setCreateSchedule(false); setModal('add') }
  const openEdit = (r) => { reset(r); setCreateSchedule(false); setModal(r) }

  const onSubmit = async (data) => {
    if (!data.source) return toast.error('Please select a source city')
    if (!data.destination) return toast.error('Please select a destination city')
    if (data.source === data.destination) return toast.error('Source and destination cannot be the same')

    setSaving(true)
    try {
      if (modal === 'add') {
        const routeRes = await adminApi.createRoute(data)
        const newRouteId = routeRes.data.data.id
        
        if (createSchedule) {
          if (!data.busId || !data.travelDate || !data.departureTime || !data.arrivalTime || !data.pricePerSeat) {
             toast.error('Route created, but missing schedule fields.')
          } else {
             await adminApi.createSchedule({
                routeId: newRouteId,
                busId: data.busId,
                travelDate: data.travelDate,
                departureTime: data.departureTime,
                arrivalTime: data.arrivalTime,
                pricePerSeat: data.pricePerSeat
             })
             toast.success('Route & Schedule created!')
          }
        } else {
          toast.success('Route created!')
        }
      } else {
        await adminApi.updateRoute(modal.id, data)
        toast.success('Route updated!')
      }
      setModal(null)
      fetchRoutes()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save route')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this route?')) return
    try {
      await adminApi.deleteRoute(id)
      toast.success('Route deactivated')
      fetchRoutes()
    } catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight">Route Management</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Manage source-destination routes across India</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 !py-2.5 !px-5 !text-sm">
          <FaPlus /> Add Route
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Destination</th>
                <th>Distance (km)</th>
                <th>Est. Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6}><div className="h-8 skeleton rounded m-2" /></td></tr>
                ))
              ) : routes.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500 font-semibold">No routes found. Add your first route!</td></tr>
              ) : routes.map(r => (
                <tr key={r.id}>
                  <td className="font-medium text-slate-800 font-bold">{r.source}</td>
                  <td className="font-medium text-slate-800 font-bold">{r.destination}</td>
                  <td className="text-slate-700 font-semibold">{r.distanceKm} km</td>
                  <td className="text-slate-700 font-semibold">{Math.floor(r.estimatedDurationMinutes / 60)}h {r.estimatedDurationMinutes % 60}m</td>
                  <td><span className={`badge ${r.active ? 'badge-success' : 'badge-danger'}`}>{r.active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors"><FaEdit className="text-xs" /></button>
                      <button onClick={() => handleDelete(r.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"><FaTrash className="text-xs" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-xl text-slate-800">{modal === 'add' ? '+ Add New Route' : 'Edit Route'}</h3>
                <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-700 transition-colors"><FaTimes /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Source City with autocomplete */}
                <Controller
                  name="source"
                  control={control}
                  rules={{ required: 'Source city is required' }}
                  render={({ field }) => (
                    <CityAutocomplete
                      label="Source City *"
                      id="source-city"
                      placeholder="Type to search city (e.g. Mumbai)"
                      value={field.value || ''}
                      onChange={field.onChange}
                      error={errors.source?.message}
                    />
                  )}
                />

                {/* Destination City with autocomplete */}
                <Controller
                  name="destination"
                  control={control}
                  rules={{ required: 'Destination city is required' }}
                  render={({ field }) => (
                    <CityAutocomplete
                      label="Destination City *"
                      id="destination-city"
                      placeholder="Type to search city (e.g. Bangalore)"
                      value={field.value || ''}
                      onChange={field.onChange}
                      error={errors.destination?.message}
                    />
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Distance (km) *</label>
                    <input type="number" className="input-field text-sm font-medium" step="0.1" placeholder="e.g. 450"
                      {...register('distanceKm', { required: 'Required', min: { value: 1, message: 'Must be > 0' }, valueAsNumber: true })} />
                    {errors.distanceKm && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.distanceKm.message}</p>}
                  </div>
                  <div>
                    <label className="input-label">Duration (minutes) *</label>
                    <input type="number" className="input-field text-sm font-medium" placeholder="e.g. 360"
                      {...register('estimatedDurationMinutes', { required: 'Required', min: { value: 1, message: 'Must be > 0' }, valueAsNumber: true })} />
                    {errors.estimatedDurationMinutes && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.estimatedDurationMinutes.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Source State</label>
                    <input className="input-field text-sm font-medium" placeholder="e.g. Maharashtra" {...register('sourceState')} />
                  </div>
                  <div>
                    <label className="input-label">Destination State</label>
                    <input className="input-field text-sm font-medium" placeholder="e.g. Goa" {...register('destinationState')} />
                  </div>
                </div>

                {modal === 'add' && (
                  <div className="border-t border-slate-200 pt-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                      <input type="checkbox" checked={createSchedule} onChange={(e) => setCreateSchedule(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                      <span className="text-sm font-bold text-slate-700">Also create a Schedule (Bus Trip) now</span>
                    </label>

                    {createSchedule && (
                      <div className="space-y-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                        <div>
                          <label className="input-label">Bus *</label>
                          <select className="input-field text-sm font-medium bg-white" {...register('busId', { required: createSchedule ? 'Required' : false, valueAsNumber: true })}>
                            <option value="">Select bus</option>
                            {buses.map(b => <option key={b.id} value={b.id}>{b.busName} ({b.busNumber})</option>)}
                          </select>
                          {errors.busId && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.busId.message}</p>}
                        </div>

                        <div>
                          <label className="input-label">Travel Date *</label>
                          <input type="date" min={new Date().toISOString().split('T')[0]} className="input-field text-sm font-medium bg-white" 
                            {...register('travelDate', { required: createSchedule ? 'Required' : false })} />
                          {errors.travelDate && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.travelDate.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="input-label">Departure Time *</label>
                            <input type="time" className="input-field text-sm font-medium bg-white" {...register('departureTime', { required: createSchedule ? 'Required' : false })} />
                            {errors.departureTime && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.departureTime.message}</p>}
                          </div>
                          <div>
                            <label className="input-label">Arrival Time *</label>
                            <input type="time" className="input-field text-sm font-medium bg-white" {...register('arrivalTime', { required: createSchedule ? 'Required' : false })} />
                            {errors.arrivalTime && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.arrivalTime.message}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="input-label">Price Per Seat (₹) *</label>
                          <input type="number" min="1" step="0.01" className="input-field text-sm font-medium bg-white" placeholder="e.g. 499"
                            {...register('pricePerSeat', { required: createSchedule ? 'Required' : false, min: { value: 1, message: 'Must be > 0' }, valueAsNumber: true })} />
                          {errors.pricePerSeat && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.pricePerSeat.message}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1 !py-2.5">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 !py-2.5">
                    {saving ? 'Saving...' : modal === 'add' ? 'Add Route' : 'Update'}
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
