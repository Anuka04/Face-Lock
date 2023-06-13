import React, { Component } from "react";
import axios from "axios";

class FaceRec extends Component {
  constructor(props) {
    super(props);
    this.state = {
      capturing: false,
      frames: [],
      prediction: "",
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
  sendFramesToBackend = async () => {
    try {
      const response = await axios.post("http://localhost:5001/facerec_data", {
        frames: this.state.frames,
      });

      // Handle the response from the Flask backend
      console.log(response.data); // Log the response data
      const { prediction } = response.data;
      this.setState({ prediction });
    } catch (error) {
      console.error(error);
      // Handle errors
    }
  };
  render() {
    const { capturing, prediction } = this.state;

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
