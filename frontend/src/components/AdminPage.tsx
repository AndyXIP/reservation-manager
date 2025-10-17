import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { organizationApi, resourceApi } from '../services/api';
import type { Organization, Resource } from '../types/api';

export default function AdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Organization form
  const [orgName, setOrgName] = useState('');

  // Resource form
  const [resourceForm, setResourceForm] = useState({
    organization_id: '',
    name: '',
    type: '',
    capacity: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [orgsRes, resourcesRes] = await Promise.all([
        organizationApi.list(),
        resourceApi.list(),
      ]);
      setOrganizations(orgsRes.data);
      setResources(resourcesRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    }
  };

  const handleCreateOrg = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await organizationApi.create({ name: orgName });
      setSuccess('Organization created successfully!');
      setOrgName('');
      loadData();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to create organization'
        : 'Failed to create organization';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = {
        organization_id: parseInt(resourceForm.organization_id),
        name: resourceForm.name,
        type: resourceForm.type || undefined,
        capacity: resourceForm.capacity ? parseInt(resourceForm.capacity) : undefined,
      };

      await resourceApi.create(data);
      setSuccess('Resource created successfully!');
      setResourceForm({
        organization_id: resourceForm.organization_id,
        name: '',
        type: '',
        capacity: '',
      });
      loadData();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to create resource'
        : 'Failed to create resource';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getOrgName = (orgId: number) => {
    const org = organizations.find((o) => o.id === orgId);
    return org ? org.name : `Org #${orgId}`;
  };

  return (
    <div className="admin-page">
      <h2>Admin Panel</h2>
      <p className="admin-description">
        Create organizations and resources before making reservations.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="admin-grid">
        {/* Create Organization */}
        <div className="admin-section">
          <h3>Create Organization</h3>
          <form onSubmit={handleCreateOrg}>
            <div className="form-group">
              <label htmlFor="org-name">Organization Name *</label>
              <input
                type="text"
                id="org-name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g., Downtown Restaurant"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
              Create Organization
            </button>
          </form>

          <div className="list-section">
            <h4>Existing Organizations ({organizations.length})</h4>
            {organizations.length === 0 ? (
              <p className="no-data">No organizations yet</p>
            ) : (
              <ul className="item-list">
                {organizations.map((org) => (
                  <li key={org.id}>
                    <strong>{org.name}</strong>
                    <span className="item-id">ID: {org.id}</span>
                    <button
                      className="btn btn-danger btn-xs"
                      style={{ marginLeft: '1em' }}
                      onClick={async () => {
                        if (!confirm(`Delete organization '${org.name}'? This will also delete its resources.`)) return;
                        setLoading(true);
                        setError('');
                        setSuccess('');
                        try {
                          await organizationApi.delete(org.id);
                          setSuccess('Organization deleted');
                          loadData();
                        } catch (err: unknown) {
                          setError('Failed to delete organization');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Create Resource */}
        <div className="admin-section">
          <h3>Create Resource</h3>
          {organizations.length === 0 ? (
            <p className="warning-message">
              ⚠️ Create an organization first before adding resources
            </p>
          ) : (
            <form onSubmit={handleCreateResource}>
              <div className="form-group">
                <label htmlFor="resource-org">Organization *</label>
                <select
                  id="resource-org"
                  value={resourceForm.organization_id}
                  onChange={(e) =>
                    setResourceForm({ ...resourceForm, organization_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select organization...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="resource-name">Resource Name *</label>
                <input
                  type="text"
                  id="resource-name"
                  value={resourceForm.name}
                  onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                  placeholder="e.g., Table 1, Room A"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="resource-type">Type</label>
                  <input
                    type="text"
                    id="resource-type"
                    value={resourceForm.type}
                    onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                    placeholder="e.g., table, room"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="resource-capacity">Capacity</label>
                  <input
                    type="number"
                    id="resource-capacity"
                    value={resourceForm.capacity}
                    onChange={(e) =>
                      setResourceForm({ ...resourceForm, capacity: e.target.value })
                    }
                    placeholder="e.g., 4"
                    min="1"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary">
                Create Resource
              </button>
            </form>
          )}

          <div className="list-section">
            <h4>Existing Resources ({resources.length})</h4>
            {resources.length === 0 ? (
              <p className="no-data">No resources yet</p>
            ) : (
              <ul className="item-list">
                {resources.map((resource) => (
                  <li key={resource.id}>
                    <div className="resource-info">
                      <strong>{resource.name}</strong>
                      {resource.type && <span className="resource-type">{resource.type}</span>}
                      {resource.capacity && (
                        <span className="resource-capacity">Capacity: {resource.capacity}</span>
                      )}
                    </div>
                    <span className="item-org">{getOrgName(resource.organization_id)}</span>
                    <button
                      className="btn btn-danger btn-xs"
                      style={{ marginLeft: '1em' }}
                      onClick={async () => {
                        if (!confirm(`Delete resource '${resource.name}'?`)) return;
                        setLoading(true);
                        setError('');
                        setSuccess('');
                        try {
                          await resourceApi.delete(resource.id);
                          setSuccess('Resource deleted');
                          loadData();
                        } catch (err: unknown) {
                          setError('Failed to delete resource');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
