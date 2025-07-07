import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import Cloud from './pages/cloud';
import FairnessInfo from './pages/fairness_info';
import 'bootstrap/dist/css/bootstrap.min.css';
import AddDataset from './pages/add_dataset';
import Search from './pages/search';

function App() {
  return (
      <Router basename='/CHe-cloud'>
        <Routes>
          <Route basename={'/CHe-cloud'} path='*' element={<Cloud />} /> 
          <Route basename={'/CHe-cloud'} path='/fairness-info' element={<FairnessInfo />} />
          <Route basename={'/CHe-cloud'} path='/add-dataset' element={<AddDataset />} />
          <Route basename={'/CHe-cloud'} path='/search' element={<Search />} />
        </Routes>
      </Router>
  );
}


export default App;
