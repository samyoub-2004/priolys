// App.js
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login/Login"
import SignUpPage from "./pages/SignUp/SignUp"

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpPage />} />

        </Routes>
      </Router>
    </I18nextProvider>
  );
}
 
export default App;