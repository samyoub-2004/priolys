// App.js
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Router>
    </I18nextProvider>
  );
}

export default App;