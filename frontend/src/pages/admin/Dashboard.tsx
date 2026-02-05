import React, { useState, useEffect } from 'react';
import { LogOut, Trash2, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { publicApi } from '@/services/publicApi';
import { adminApi } from '@/services/adminApi';
import { Wing } from '@/types/wing';
import { Photo } from '@/types/photo';
import { Activity } from '@/types/activity';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [wings, setWings] = useState<Wing[]>([]);
  const [selectedWing, setSelectedWing] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'activities'>('photos');
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    activity_date: '',
    faculty_coordinator: '',
  });
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [submittingActivity, setSubmittingActivity] = useState(false);

  useEffect(() => {
    fetchWings();
  }, []);

  useEffect(() => {
    if (selectedWing) {
      fetchWingData();
    }
  }, [selectedWing, activeTab]);

  const fetchWings = async () => {
    try {
      const data = await publicApi.getAllWings();
      setWings(data);
      if (data.length > 0) {
        setSelectedWing(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch wings:', error);
    }
  };

  const fetchWingData = async () => {
    if (!selectedWing) return;
    
    const wing = wings.find((w) => w.id === selectedWing);
    if (!wing) return;

    try {
      if (activeTab === 'photos') {
        const data = await publicApi.getWingPhotos(wing.slug);
        setPhotos(data);
      } else {
        const data = await publicApi.getWingActivities(wing.slug);
        setActivities(data);
      }
    } catch (error) {
      console.error('Failed to fetch wing data:', error);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedWing) return;
    
    const files = Array.from(e.target.files);
    setUploadingPhotos(true);

    try {
      await adminApi.uploadPhotos(selectedWing, files);
      await fetchWingData();
      alert('Photos uploaded successfully!');
    } catch (error) {
      alert('Failed to upload photos');
      console.error(error);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      await adminApi.deletePhoto(photoId);
      await fetchWingData();
      alert('Photo deleted successfully!');
    } catch (error) {
      alert('Failed to delete photo');
      console.error(error);
    }
  };

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWing) return;

    setSubmittingActivity(true);
    try {
      await adminApi.createActivity({
        wingId: selectedWing,
        title: activityForm.title,
        description: activityForm.description,
        activityDate: activityForm.activity_date,
        facultyCoordinator: activityForm.faculty_coordinator || undefined,
        reportFile: reportFile || undefined
      });
      setActivityForm({ title: '', description: '', activity_date: '', faculty_coordinator: '' });
      setReportFile(null);
      setShowActivityForm(false);
      await fetchWingData();
      alert('Activity created successfully!');
    } catch (error) {
      alert('Failed to create activity');
      console.error(error);
    } finally {
      setSubmittingActivity(false);
    }
  };

  const handleDeleteActivity = async (activityId: number) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      await adminApi.deleteActivity(activityId);
      await fetchWingData();
      alert('Activity deleted successfully!');
    } catch (error) {
      alert('Failed to delete activity');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.username}</p>
            </div>
            <Button variant="outline" onClick={logout} className="inline-flex items-center">
              <LogOut size={20} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Select Wing</h2>
          <select
            value={selectedWing || ''}
            onChange={(e) => setSelectedWing(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {wings.map((wing) => (
              <option key={wing.id} value={wing.id}>
                {wing.name}
              </option>
            ))}
          </select>
        </Card>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'photos'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Photos
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'activities'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Activities
          </button>
        </div>

        {activeTab === 'photos' && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold mb-4">Upload Photos</h2>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                disabled={uploadingPhotos}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {uploadingPhotos && (
                <div className="mt-4 flex items-center text-primary-600">
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Uploading...
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">Manage Photos ({photos.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt={`Photo ${photo.id}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Create Activity</h2>
                <Button
                  onClick={() => setShowActivityForm(!showActivityForm)}
                  size="sm"
                  className="inline-flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  {showActivityForm ? 'Cancel' : 'Add New'}
                </Button>
              </div>

              {showActivityForm && (
                <form onSubmit={handleSubmitActivity} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={activityForm.title}
                      onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={activityForm.description}
                      onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activity Date
                    </label>
                    <input
                      type="date"
                      value={activityForm.activity_date}
                      onChange={(e) => setActivityForm({ ...activityForm, activity_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Faculty Coordinator
                    </label>
                    <input
                      type="text"
                      value={activityForm.faculty_coordinator}
                      onChange={(e) => setActivityForm({ ...activityForm, faculty_coordinator: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report PDF (Optional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500"
                    />
                  </div>

                  <Button type="submit" disabled={submittingActivity}>
                    {submittingActivity ? 'Creating...' : 'Create Activity'}
                  </Button>
                </form>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">Manage Activities ({activities.length})</h2>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{activity.title}</h3>
                      <p className="text-sm text-gray-600">{activity.activity_date}</p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="inline-flex items-center"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
