'use client';

import { createVehicle, updateVehicle } from '@/app/actions';
import { Vehicle } from '@/lib/db';
import Link from 'next/link';

export default function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const isEditing = !!vehicle;
  const action = isEditing ? updateVehicle.bind(null, vehicle.id) : createVehicle;

  return (
    <form action={action} className="glass-card animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
        {isEditing ? 'Edit Vehicle' : 'Register New Vehicle'}
      </h2>

      <div className="input-group">
        <label className="input-label" htmlFor="type">Vehicle Type</label>
        <select className="input-field" id="type" name="type" required defaultValue={vehicle?.type || 'Bus'}>
          <option value="Bus">Bus</option>
          <option value="Private Car">Private Car</option>
          <option value="Taxi">Taxi</option>
          <option value="Ambulance">Ambulance</option>
          <option value="Minivan">Minivan</option>
          <option value="Truck">Truck</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="registration">Registration Number</label>
        <input className="input-field" type="text" id="registration" name="registration" required defaultValue={vehicle?.registration} placeholder="ABC-1234" style={{ textTransform: 'uppercase' }} />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="capacity">Seating Capacity</label>
        <input className="input-field" type="number" id="capacity" name="capacity" required min="1" max="200" defaultValue={vehicle?.capacity} placeholder="4" />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="make_model">Make & Model</label>
        <input className="input-field" type="text" id="make_model" name="make_model" required defaultValue={vehicle?.make_model} placeholder="e.g. Toyota Hiace" />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="status">Status</label>
        <select className="input-field" id="status" name="status" required defaultValue={vehicle?.status || 'Active'}>
          <option value="Active">Active</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Out of Service">Out of Service</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {isEditing ? 'Save Changes' : 'Register Vehicle'}
        </button>
        <Link href="/vehicles" className="btn btn-secondary" style={{ flex: 1 }}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
