import React, { Component } from "react";
import axios from "axios";

class Liveness extends Component {
  constructor(props) {
    super(props);
    this.state = {
      capturing: false,
      frames: [],
      prediction: "",
      probability: 0,
    };
    this.videoRef = React.createRef();
    this.captureInterval = null;
  }

  componentDidMount() {
    navigator.mediaDevices.getUserMedia({ video: true })
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

    // Send captured frames to the Flask backend for liveness detection
    this.sendFramesToBackend();
  };

  sendFramesToBackend = async () => {
    try {
      const response = await axios.post("/liveness_detection", {
        frames: this.state.frames,
      });

      // Handle the response from the Flask backend
      const { prediction, probability } = response.data;
      this.setState({ prediction, probability });

    } catch (error) {
      console.error(error);
      // Handle errors
    }
  };

  render() {
    const { capturing, prediction, probability } = this.state;

    return (
      <div>
        <h1>Liveness Detection</h1>
        <video ref={this.videoRef} autoPlay muted />
        {!capturing ? (
          <button onClick={this.startCapture}>Start Capture</button>
        ) : (
          <button onClick={this.stopCapture}>Stop Capture</button>
        )}
        {prediction && (
          <div>
            <h2>Result</h2>
            <p>Prediction: {prediction}</p>
            <p>Probability: {probability}</p>
          </div>
        )}
      </div>
    );
  }
}

export default Liveness;
