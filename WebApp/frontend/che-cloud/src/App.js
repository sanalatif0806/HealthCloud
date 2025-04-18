import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import Cloud from './pages/cloud';
import FairnessInfo from './pages/fairness_info';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
      <Router basename='/CHe-Cloud'>
        <Routes>
          <Route basename={'/CHe-Cloud'} path='*' element={<Cloud />} /> 
          <Route basename={'/CHe-Cloud'} path='/fairness-info' element={<FairnessInfo />} />
        </Routes>
      </Router>
  );
}


export default App;
