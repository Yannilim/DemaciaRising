import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./Banner";
import Map from "./Map";
import Tree from "./Tree";
import "../sass/App.scss";
import Banner from "./Banner";

function App() {
  return (
    <Router>
      <Banner />

      <Routes>
        <Route path="/map" element={<Map />} />
        <Route path="/tree" element={<Tree />} />
      </Routes>
    </Router>
  );
}

export default App;
