import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import "./input.css";
import Yumemi from './Yumemi.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Yumemi/>
  </StrictMode>,
)
