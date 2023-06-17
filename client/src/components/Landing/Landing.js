import React, { Component } from "react";
import { Link } from "react-router-dom";

class Landing extends Component {
  render() {
    return (
      <div className="container">
        <div className="jumbotron mt-5">
          <div className="col-sm-8 mx-auto">
            <h1 className="text-center">WELCOME</h1>
            <p className="text-center">
              Secure and User-friendly Authentication for Digital Transactions
            </p>
            <div className="text-center">
              <Link to="/register" className="btn btn-primary mr-3">
                Register
              </Link>
              <Link to="/login" className="btn btn-primary mr-3">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;
