import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

class Landing extends Component {
  render() {
    return (
      <body>
      <div className="container_land">
        <div className="jumbotron mt-5">
          <div className="col-sm-8 mx-auto">
            <h1 className="text-center2">Welcome User!!</h1>
            <h2 className="second">To the future of secure banking with facial recognition!</h2>
            <h3 className="third">
              Our revolutionary system combines advanced facial recognition technology with OTP authentication to provide you with 
              a safe and efficient banking experience.With our system, you can rest assured that your transactions 
              are processed securely and your privacy is protected. Say goodbye to the hassle of traditional banking 
              and join us on the cutting edge of banking technology.
            </h3>
            <p className="Image">
            </p>
            <div className="text-center2">
              <Link to="/register" className="btn-land btn-primary mr-3 register">
                Register
              </Link>
              <Link to="/login" className="btn-land btn-primary mr-3 login">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
      </body>
    );
  }
}

export default Landing;
