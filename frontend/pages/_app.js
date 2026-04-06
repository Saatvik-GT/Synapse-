import '../styles/globals.css';

import Sidebar from '../components/Sidebar';
import { useState } from 'react';

function MyApp({ Component, pageProps }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div>
      

      {/* Main Content */}
      <div className="flex-1">
        <Component {...pageProps} activeTab={activeTab} />
      </div>

    </div>
  );
}

export default MyApp;
