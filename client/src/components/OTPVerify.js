import React, { Component } from "react";
import axios from "axios";

class OTPVerify extends Component {
  constructor(props) {
    super(props);
    this.state = {
      otp: "",
      message: "",
    };
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
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  handleChange = (e) => {
    this.setState({ otp: e.target.value });
  };

  render() {
    return (
      <div>
        <br />
        <h3>Enter your OTP for verification</h3>
        <br />
        <form onSubmit={this.handleSubmit}>
          <label>
            Enter OTP:
            <br />
            <input
              type="text"
              name="otp"
              value={this.state.otp}
              onChange={this.handleChange}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                marginRight: "10px",
                width: "200px",
              }}
            />
          </label>
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              backgroundColor: "blue",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </form>
        {this.state.message && <p>{this.state.message}</p>}
      </div>
    );
  }
}

export default OTPVerify;
