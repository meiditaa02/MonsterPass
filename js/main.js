// main.js
// Entry point: queries DOM elements, instantiates AppController, calls init()

import { AppController } from './appController.js';

const inputEl    = document.getElementById('password-input');
const toggleBtn  = document.getElementById('toggle-btn');
const monsterEl  = document.getElementById('monster');
const messageEl  = document.getElementById('monster-message');
const ariaLiveEl = document.getElementById('strength-live');

const app = new AppController({ inputEl, toggleBtn, monsterEl, messageEl, ariaLiveEl });
app.init();
