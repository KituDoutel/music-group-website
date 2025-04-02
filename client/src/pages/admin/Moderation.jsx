import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab } from '@headlessui/react';
import FlaggedContentTable from '../../components/admin/FlaggedContentTable';
import ModerationActions from '../../components/admin/ModerationActions';

const ModerationPage = () => {
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flagsRes, actionsRes] = await Promise.all([
          axios.get('/api/admin/moderation/flags'),
          axios.get('/api/admin/moderation/actions')
        ]);
        setFlaggedContent(flagsRes.data);
        setActions(actionsRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAction = async (action, contentId, contentType) => {
    try {
      await axios.post('/api/admin/moderation/actions', {
        actionType: action,
        contentType,
        contentId,
        reason: 'Violation of community guidelines'
      });
      // Refresh data
      const [flagsRes] = await axios.get('/api/admin/moderation/flags');
      setFlaggedContent(flagsRes.data);
    } catch (err) {
      console.error('Failed to apply action:', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Content Moderation</h2>
      
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-4">
          <Tab className="py-2 px-4 rounded-md ui-selected:bg-white ui-selected:shadow">
            Flagged Content ({flaggedContent.length})
          </Tab>
          <Tab className="py-2 px-4 rounded-md ui-selected:bg-white ui-selected:shadow">
            Moderation Log
          </Tab>
        </Tab.List>
        
        <Tab.Panels>
          <Tab.Panel>
            <FlaggedContentTable 
              data={flaggedContent} 
              onAction={handleAction}
              loading={loading}
            />
          </Tab.Panel>
          <Tab.Panel>
            <ModerationActions 
              actions={actions} 
              loading={loading}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default ModerationPage;