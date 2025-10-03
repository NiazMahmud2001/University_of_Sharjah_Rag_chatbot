import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import Proxy from './components/proxy/proxy.jsx';
import Loader from './components/loader/Loader.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Proxy/>}/>
        {/* <Route path="/" element={<App/>}/>
        <Route path="/nextly-UOS" element={<App/>}/>
        <Route path="/nextly-UOSLoader" element={<Proxy/>}/> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
