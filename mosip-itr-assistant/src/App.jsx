import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './pages/Landing';

const App = () => {
  return (
    <div className="app-min-height">
      <Header />
      <main>
        <Landing />
      </main>
      <Footer />
    </div>
  );
};

export default App;
