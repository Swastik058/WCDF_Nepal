import { useCallback, useEffect, useMemo, useState } from 'react';
import FormInput from '../../components/admin/FormInput';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import { adminApi } from '../../services/adminApi';
import { formatCurrency, formatDate } from '../../utils/adminFormat';

const initialForm = {
  title: '',
  description: '',
  eventDate: '',
  location: '',
  eventType: 'other',
  expectedParticipants: 0,
  budget: 0,
  status: 'planned',
};

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [approvedVolunteers, setApprovedVolunteers] = useState([]);
  const [assignedVolunteers, setAssignedVolunteers] = useState([]);
  const [trackingItems, setTrackingItems] = useState([]);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [trackingForms, setTrackingForms] = useState({});
  const [selectedEventId, setSelectedEventId] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [savingTrackingId, setSavingTrackingId] = useState('');
  const [error, setError] = useState('');
  const [detailsError, setDetailsError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);
  const selectedEvent = useMemo(
    () => events.find((item) => item._id === selectedEventId) || null,
    [events, selectedEventId],
  );

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getEvents();
      setEvents(data);

      if (data.length && !selectedEventId) {
        setSelectedEventId(data[0]._id);
      }

      if (data.length && selectedEventId && !data.some((item) => item._id === selectedEventId)) {
        setSelectedEventId(data[0]._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  const loadApprovedVolunteers = useCallback(async () => {
    try {
      const data = await adminApi.getApprovedVolunteers();
      setApprovedVolunteers(data);
    } catch (err) {
      setDetailsError(err.message || 'Failed to fetch approved volunteers');
    }
  }, []);

  const loadEventVolunteerDetails = useCallback(async (activityId) => {
    if (!activityId) {
      setAssignedVolunteers([]);
      setTrackingItems([]);
      setTrackingForms({});
      return;
    }

    setDetailsLoading(true);
    setDetailsError('');

    try {
      const [assignedResponse, trackingResponse] = await Promise.all([
        adminApi.getAssignedVolunteersForActivity(activityId),
        adminApi.getVolunteerTrackingForActivity(activityId),
      ]);

      setAssignedVolunteers(assignedResponse.assignedVolunteers || []);
      setTrackingItems(trackingResponse.items || []);

      const nextForms = {};
      (trackingResponse.items || []).forEach((item) => {
        nextForms[item.volunteer._id] = {
          participationStatus: item.tracking?.participationStatus || 'assigned',
          hoursCompleted: item.tracking?.hoursCompleted || 0,
          remarks: item.tracking?.remarks || '',
        };
      });
      setTrackingForms(nextForms);
    } catch (err) {
      setDetailsError(err.message || 'Failed to load volunteer assignment details');
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    loadApprovedVolunteers();
  }, [loadApprovedVolunteers, loadEvents]);

  useEffect(() => {
    if (selectedEventId) {
      loadEventVolunteerDetails(selectedEventId);
    }
  }, [loadEventVolunteerDetails, selectedEventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.eventDate) return 'Event date is required';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      if (isEditing) {
        await adminApi.updateEvent(editingId, form);
      } else {
        await adminApi.createEvent(form);
      }
      resetForm();
      await loadEvents();
    } catch (err) {
      setError(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title || '',
      description: item.description || '',
      eventDate: item.eventDate ? item.eventDate.slice(0, 10) : '',
      location: item.location || '',
      eventType: item.eventType || 'other',
      expectedParticipants: item.expectedParticipants || 0,
      budget: item.budget || 0,
      status: item.status || 'planned',
    });
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    setError('');
    try {
      await adminApi.deleteEvent(id);
      await loadEvents();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message || 'Failed to delete event');
    }
  };

  const handleAssignVolunteer = async () => {
    if (!selectedEventId || !selectedVolunteerId) {
      setDetailsError('Select an approved volunteer to assign.');
      return;
    }

    setAssigning(true);
    setDetailsError('');
    setSuccessMessage('');

    try {
      await adminApi.assignVolunteerToActivity(selectedEventId, { volunteerId: selectedVolunteerId });
      setSelectedVolunteerId('');
      setSuccessMessage('Volunteer assigned successfully.');
      await loadEvents();
      await loadEventVolunteerDetails(selectedEventId);
    } catch (err) {
      setDetailsError(err.message || 'Failed to assign volunteer');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveVolunteer = async (volunteerId) => {
    if (!selectedEventId) return;
    setDetailsError('');
    setSuccessMessage('');

    try {
      await adminApi.removeVolunteerFromActivity(selectedEventId, { volunteerId });
      setSuccessMessage('Volunteer removed successfully.');
      await loadEvents();
      await loadEventVolunteerDetails(selectedEventId);
    } catch (err) {
      setDetailsError(err.message || 'Failed to remove volunteer');
    }
  };

  const updateTrackingForm = (volunteerId, field, value) => {
    setTrackingForms((prev) => ({
      ...prev,
      [volunteerId]: {
        ...prev[volunteerId],
        [field]: value,
      },
    }));
  };

  const handleSaveTracking = async (volunteerId) => {
    if (!selectedEventId) return;
    const formState = trackingForms[volunteerId];
    if (!formState) return;

    setSavingTrackingId(volunteerId);
    setDetailsError('');
    setSuccessMessage('');

    try {
      await adminApi.updateVolunteerTrackingForActivity(selectedEventId, volunteerId, formState);
      setSuccessMessage('Volunteer tracking updated successfully.');
      await loadEvents();
      await loadEventVolunteerDetails(selectedEventId);
    } catch (err) {
      setDetailsError(err.message || 'Failed to update volunteer tracking');
    } finally {
      setSavingTrackingId('');
    }
  };

  const availableVolunteers = approvedVolunteers.filter(
    (volunteer) => !assignedVolunteers.some((item) => item._id === volunteer._id),
  );

  return (
    <div>
      <PageHeader title="Events Management" description="Create events and manage volunteer assignments and tracking" />

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900">{isEditing ? 'Edit Event' : 'Add Event'}</h2>

          <FormInput label="Title" name="title" value={form.title} onChange={handleChange} required />
          <FormInput label="Event Date" name="eventDate" type="date" value={form.eventDate} onChange={handleChange} required />
          <FormInput label="Location" name="location" value={form.location} onChange={handleChange} />

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Event Type</span>
            <select name="eventType" value={form.eventType} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500">
              <option value="fundraiser">Fundraiser</option>
              <option value="awareness">Awareness</option>
              <option value="community">Community</option>
              <option value="training">Training</option>
              <option value="other">Other</option>
            </select>
          </label>

          <FormInput label="Expected Participants" name="expectedParticipants" type="number" min="0" value={form.expectedParticipants} onChange={handleChange} />
          <FormInput label="Budget" name="budget" type="number" min="0" step="0.01" value={form.budget} onChange={handleChange} />

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Status</span>
            <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500">
              <option value="planned">Planned</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Description</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </label>

          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70">
              {submitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
            {isEditing ? <button type="button" onClick={resetForm} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">Cancel</button> : null}
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </form>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Events List</h2>
          <div className="mt-3">
            <TableState loading={loading} error={error && events.length === 0 ? error : ''} empty={!loading && events.length === 0} emptyText="No events found." />

            {!loading && events.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-2">Title</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Budget</th>
                      <th className="py-2">Assigned</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((item) => (
                      <tr key={item._id} className={`border-t border-slate-100 ${selectedEventId === item._id ? 'bg-slate-50' : ''}`}>
                        <td className="py-2 font-medium text-slate-900">{item.title}</td>
                        <td className="py-2">{formatDate(item.eventDate)}</td>
                        <td className="py-2">{item.status}</td>
                        <td className="py-2">{formatCurrency(item.budget)}</td>
                        <td className="py-2">{item.assignedVolunteers?.length || 0}</td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setSelectedEventId(item._id)} className="text-emerald-600 hover:underline">Manage Volunteers</button>
                            <button type="button" onClick={() => handleEdit(item)} className="text-indigo-600 hover:underline">Edit</button>
                            <button type="button" onClick={() => handleDelete(item._id)} className="text-rose-600 hover:underline">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Assigned Volunteers</h2>
            <p className="mt-1 text-sm text-slate-600">
              {selectedEvent ? `Manage approved volunteers for ${selectedEvent.title}.` : 'Select an event to manage volunteers.'}
            </p>
          </div>

          {detailsError ? <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{detailsError}</div> : null}
          {successMessage ? <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</div> : null}

          {selectedEvent ? (
            <>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                <select
                  value={selectedVolunteerId}
                  onChange={(e) => setSelectedVolunteerId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="">Select approved volunteer</option>
                  {availableVolunteers.map((volunteer) => (
                    <option key={volunteer._id} value={volunteer._id}>
                      {volunteer.fullName} ({volunteer.email})
                    </option>
                  ))}
                </select>
                <button type="button" onClick={handleAssignVolunteer} disabled={assigning || !selectedVolunteerId} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70">
                  {assigning ? 'Assigning...' : 'Assign Volunteer'}
                </button>
              </div>

              <TableState
                loading={detailsLoading}
                error=""
                empty={!detailsLoading && assignedVolunteers.length === 0}
                emptyText="No volunteers assigned to this activity yet."
              />

              {!detailsLoading && assignedVolunteers.length > 0 ? (
                <div className="space-y-3">
                  {assignedVolunteers.map((volunteer) => (
                    <div key={volunteer._id} className="flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{volunteer.name || volunteer.fullName}</p>
                        <p className="text-sm text-slate-600">{volunteer.email}</p>
                        <p className="text-xs text-slate-500">Total hours: {volunteer.totalVolunteerHours || 0}</p>
                      </div>
                      <button type="button" onClick={() => handleRemoveVolunteer(volunteer._id)} className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Volunteer Tracking</h2>
            <p className="mt-1 text-sm text-slate-600">
              Record attendance, remarks, and completed hours for assigned volunteers.
            </p>
          </div>

          <TableState
            loading={detailsLoading}
            error=""
            empty={!detailsLoading && trackingItems.length === 0}
            emptyText="Assign volunteers first to start tracking."
          />

          {!detailsLoading && trackingItems.length > 0 ? (
            <div className="space-y-4">
              {trackingItems.map((item) => {
                const volunteerId = item.volunteer._id;
                const trackingForm = trackingForms[volunteerId] || {
                  participationStatus: 'assigned',
                  hoursCompleted: 0,
                  remarks: '',
                };

                return (
                  <div key={volunteerId} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3">
                      <p className="font-medium text-slate-900">{item.volunteer.name}</p>
                      <p className="text-sm text-slate-600">{item.volunteer.email}</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-slate-700">Participation Status</span>
                        <select
                          value={trackingForm.participationStatus}
                          onChange={(e) => updateTrackingForm(volunteerId, 'participationStatus', e.target.value)}
                          className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                        >
                          <option value="assigned">Assigned</option>
                          <option value="attended">Attended</option>
                          <option value="missed">Missed</option>
                          <option value="completed">Completed</option>
                        </select>
                      </label>

                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-slate-700">Hours Completed</span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={trackingForm.hoursCompleted}
                          onChange={(e) => updateTrackingForm(volunteerId, 'hoursCompleted', e.target.value)}
                          className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                        />
                      </label>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => handleSaveTracking(volunteerId)}
                          disabled={savingTrackingId === volunteerId}
                          className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-70"
                        >
                          {savingTrackingId === volunteerId ? 'Saving...' : 'Save Tracking'}
                        </button>
                      </div>
                    </div>

                    <label className="mt-3 block text-sm">
                      <span className="mb-1 block font-medium text-slate-700">Remarks</span>
                      <textarea
                        rows={3}
                        value={trackingForm.remarks}
                        onChange={(e) => updateTrackingForm(volunteerId, 'remarks', e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                      />
                    </label>

                    <p className="mt-2 text-xs text-slate-500">
                      Last updated: {item.tracking?.updatedAt ? formatDate(item.tracking.updatedAt) : 'Not updated yet'}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default EventsPage;
