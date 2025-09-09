import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import Cloud from './pages/cloud';
import FairnessInfo from './pages/fairness_info';
import 'bootstrap/dist/css/bootstrap.min.css';
import AddDataset from './pages/add_dataset';
import Search from './pages/search';
import Dashboard from './pages/dashboard';

function App() {
  return (
      <Router basename='/'>
        <Routes>
          <Route basename={'/'} path='*' element={<Cloud />} /> 
          <Route basename={'/'} path='/fairness-info' element={<FairnessInfo />} />
          <Route basename={'/'} path='/add-dataset' element={<AddDataset />} />
          <Route basename={'/'} path='/search' element={<Search />} />
          <Route basename={'/'} path='/dashboard' element={<Dashboard />} />
        </Routes>
      </Router>
  );
}


export default App;
