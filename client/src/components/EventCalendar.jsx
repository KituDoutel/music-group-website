import { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get('/api/events');
        const formattedEvents = data.map(event => ({
          title: event.event_name,
          date: event.event_date.split('T')[0],
          backgroundColor: 
            event.status === 'confirmed' ? 'green' : 
            event.status === 'pending' ? 'orange' : 'red'
        }));
        setEvents(formattedEvents);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };
    fetchEvents();
  }, []);

  const handleDateClick = (arg) => {
    const dateStr = arg.dateStr;
    // Redirect ke booking form dengan tanggal terpilih
    window.location = `/booking?date=${dateStr}`;
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        height="auto"
      />
    </div>
  );
};

export default EventCalendar;