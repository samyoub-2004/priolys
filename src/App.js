import {HashRouter as Router , Routes , Route} from "react-router-dom"
import React from "react";


import LandingPage from "./pages/LandingPage"


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>} /> 
      

      </Routes>
    </Router>
  );
}

export default App;
