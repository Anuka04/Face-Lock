import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import NavBar from "./components/NavBar";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Transaction from "./components/Transaction";
import OTPVerify from "./components/OTPVerify";

import Liveness from "./components/Liveness";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <NavBar />
          <Route exact path="/" component={Landing} />
          <div className="container">
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/profile" component={Profile} />
            <Route exact path="/transaction" component={Transaction} />
            <Route exact path="/verify" component={OTPVerify} />
            <Route exact path="/liveness" component={Liveness} />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
