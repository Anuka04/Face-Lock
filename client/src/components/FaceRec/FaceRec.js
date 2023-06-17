import React, { Component } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { Redirect } from "react-router-dom";

class FaceRec extends Component {
  constructor(props) {
    super(props);
    this.state = {
      capturing: false,
      frames: [],
      prediction: "",
      redirect: false,
    };
    this.videoRef = React.createRef();
    this.captureInterval = null;
  }

  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        const video = this.videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      })
      .catch((error) => {
        console.error("Error accessing webcam:", error);
      });
  }

  sendFramesToBackend = async () => {
    try {
      const token = localStorage.usertoken;
      const decoded = jwt_decode(token);
      // console.log(decoded);
      const username = decoded.sub.username;
      const response = await axios.post("http://localhost:5001/facerec_data", {
        frames: this.state.frames,
        username: username,
      });
      this.setState({
        username: username,
      });
      // Handle the response from the Flask backend
      console.log(response.data); // Log the response data
      const { prediction } = response.data;
      this.setState({ prediction });
      if (prediction.result === "Match found!") {
        const video = this.videoRef.current;
        if (video) {
          const stream = video.srcObject;
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
          video.srcObject = null;
        }
        this.setState({ redirect: true });
      }
    } catch (error) {
      console.error(error);
      // Handle errors
    }
  };

  startCapture = () => {
    this.setState({ frames: [], capturing: true });

    this.captureInterval = setInterval(() => {
      const video = this.videoRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataURL = canvas.toDataURL("image/jpeg");
        this.setState((prevState) => ({
          frames: [...prevState.frames, dataURL],
        }));
      }
    }, 100); // Adjust the interval as needed
  };

  stopCapture = () => {
    clearInterval(this.captureInterval);
    this.setState({ capturing: false });

    // Send captured frames to the Flask backend for face recognition
    this.sendFramesToBackend();
  };

  render() {
    const { capturing, prediction } = this.state;
    if (this.state.redirect) {
      return <Redirect to="/success" />;
    }
    return (
      <div>
        <h1>Face Recognition</h1>
        <video ref={this.videoRef} autoPlay muted />
        <br />
        <br />
        {!capturing ? (
          <button onClick={this.startCapture}>Start Capture</button>
        ) : (
          <button onClick={this.stopCapture}>Stop Capture</button>
        )}
        {prediction && (
          <div>
            <h2>Result</h2>
            <p>{prediction.result}</p>
          </div>
        )}
      </div>
    );
  }
}

export default FaceRec;
