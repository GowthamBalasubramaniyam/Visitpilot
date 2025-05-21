import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import FieldVisitLog from '../components/FieldVisitLog';
import ReportApproval from '../components/ReportApproval';

const Home = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log-visit" element={<FieldVisitLog />} />
        <Route path="/approve-reports" element={<ReportApproval reports={[]} />} />
      </Routes>
    </Router>
  );
};

export default Home;
