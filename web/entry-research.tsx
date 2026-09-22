import { initializeAnalytics } from './analytics';
import React from 'react';import {hydrateRoot} from 'react-dom/client';import Research from './app/research';import './app/globals.css';hydrateRoot(document.getElementById('root')!,<Research/>);

initializeAnalytics();
