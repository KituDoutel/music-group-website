import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MusicShop from './pages/MusicShop';
import EventOrganizing from './pages/EventOrganizing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<MusicShop />} />
        <Route path="/events" element={<EventOrganizing />} />
      </Routes>
    </Router>
  );
}

export default App;