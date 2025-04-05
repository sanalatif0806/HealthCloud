import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import Cloud from './pages/cloud';

function App() {
  return (
      <Router basename='/CHe-Cloud'>
        <Routes>
          <Route basename={'/CHe-Cloud'} path='*' element={<Cloud />} /> 
        </Routes>
      </Router>
  );
}


export default App;
