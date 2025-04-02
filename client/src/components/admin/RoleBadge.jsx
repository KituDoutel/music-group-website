import { useState } from 'react';

const roleColors = {
  user: 'bg-gray-100 text-gray-800',
  artist: 'bg-blue-100 text-blue-800',
  admin: 'bg-red-100 text-red-800'
};

const RoleBadge = ({ role, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentRole, setCurrentRole] = useState(role);

  const handleSave = () => {
    onChange(currentRole);
    setIsEditing(false);
  };

  return (
    <div className="inline-flex items-center">
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="user">User</option>
            <option value="artist">Artist</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleSave}
            className="text-green-600 hover:text-green-800"
          >
            ✓
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColors[role]}`}>
            {role.toUpperCase()}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default RoleBadge;