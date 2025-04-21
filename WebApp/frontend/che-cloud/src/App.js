import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import Cloud from './pages/cloud';
import FairnessInfo from './pages/fairness_info';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
      <Router basename='/CHe-cloud'>
        <Routes>
          <Route basename={'/CHe-cloud'} path='*' element={<Cloud />} /> 
          <Route basename={'/CHe-cloud'} path='/fairness-info' element={<FairnessInfo />} />
        </Routes>
      </Router>
  );
}


export default App;
