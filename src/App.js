import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import OCRApp from './Component/MRZReader';
import Scanner from './Component/Scanner';
import TestUrl from './Component/TestUrl';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
class App extends Component {
  constructor(props) {
    super(props);
  };

   
  render() {
    return (
      <> 
          <BrowserRouter>
          <Routes> 
            <Route index element={<OCRApp Navigate={Navigate} />} />
            <Route path="Scanner" element={<Scanner />} />
          </Routes>
        </BrowserRouter>  
      </>
    );
  }


}

export default App;
