const StatusToggle = ({ banned, onChange }) => {
    return (
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={!banned}
          onChange={() => onChange(!banned)}
          className="sr-only peer"
        />
        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        <span className="ml-3 text-sm font-medium text-gray-900">
          {banned ? 'Banned' : 'Active'}
        </span>
      </label>
    );
  };
  
  export default StatusToggle;