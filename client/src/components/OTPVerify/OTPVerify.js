import React, { Component } from "react";
import axios from "axios";
import { Redirect } from "react-router-dom";
import "./OTPVerify.css";

class OTPVerify extends Component {
  constructor(props) {
    super(props);
    this.state = {
      otp: "",
      message: "",
      redirectToFaceRec: false,
      redirectToSuccess: false,
      facever: null,
    };
  }

  componentDidMount() {
    const { state } = this.props.location;
    if (state && state.facever) {
      this.setState({ facever: state.facever });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    // Perform the submit logic or send the OTP to the server
    console.log("OTP submitted:", this.state.otp);

    // Send OTP to the server for verification
    axios
      .post("/verify", { otp: this.state.otp })
      .then((response) => {
        // Handle the server response and show pop-up messages
        this.setState({ message: response.data.message });
        if (
          response.data.message === "OTP is correct" &&
          this.state.facever !== null
        ) {
          // OTP is correct and facever has a value, redirect to /facerec
          this.setState({ redirectToFaceRec: true });
        } else if (response.data.message === "OTP is correct") {
          // No facever value, redirect to /success
          this.setState({ redirectToSuccess: true });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  handleChange = (e) => {
    this.setState({ otp: e.target.value });
  };

  render() {
    if (this.state.redirectToFaceRec) {
      return <Redirect to="/facerec" />;
    }
    if (this.state.redirectToSuccess) {
      return <Redirect to="/success" />;
    }
    const { facever } = this.state;
    return (
      <div className="container-otp">
        <br />
        <h3 className="h3-otp">Enter your OTP for verification</h3>
        <br />
        <form onSubmit={this.handleSubmit}>
          <label>Enter OTP:</label>
          <br />
          <input
            type="text"
            name="otp"
            className="in-otp"
            value={this.state.otp}
            onChange={this.handleChange}
          />

          <br></br>
          <button type="submit" className="btn-otp">
            Submit
          </button>
        </form>
        <br />
        {this.state.message && <p>{this.state.message}</p>}
        {facever && (
          <div>
            <p>You will need to perform facial recognition next as amount of</p>
            <p>transaction is greater than your threshold.</p>
          </div>
        )}
      </div>
    );
  }
}

export default OTPVerify;
