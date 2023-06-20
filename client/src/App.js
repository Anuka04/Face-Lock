import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import NavBar from "./components/NavBar/NavBar";
import Landing from "./components/Landing/Landing";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Profile from "./components/Profile/Profile";
import Transaction from "./components/Transaction/Transaction";
import OTPVerify from "./components/OTPVerify/OTPVerify";
import PostPay from "./components/PostPay/PostPay";
import FaceRec from "./components/FaceRec/FaceRec";

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
            <Route exact path="/success" component={PostPay} />
            <Route exact path="/facerec" component={FaceRec} />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
