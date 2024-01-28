// import { Component, ElementRef, ViewChild } from '@angular/core';
import { Component, ElementRef, ViewChild ,AfterViewInit } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'webcam';
  stream: any = null;
  
  trigger: Subject<void> = new Subject();
  previewImage: string = '';
  btnLabel: string = 'Capture Image';
  videoRecorder: MediaRecorder | null = null;
  videoChunks: Blob[] = [];
  isRecording = false;

  selectedCamera: MediaDeviceInfo | null = null;
  cameras: MediaDeviceInfo[] = [];

  @ViewChild('videoPlayer') videoPlayer: ElementRef|undefined;

  get $trigger(): Observable<void> {
    return this.trigger.asObservable();
  }
  ngAfterViewInit() {
    this.getAvailableCameras();
  }

  getAvailableCameras() {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        this.cameras = devices.filter(device => device.kind === 'videoinput');
        if (this.cameras.length > 0) {
          this.selectedCamera = this.cameras[0];
        }
      })
      .catch(err => console.error('Error enumerating devices: ', err));
  }

  switchCamera() {
    if (this.selectedCamera && this.stream) {
      this.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      this.startStream(this.selectedCamera);
    }
  }

  startStream(device: MediaDeviceInfo) {
    navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: device.deviceId } },
      audio: true
    }).then((res) => {
      console.log('response', res);
      this.stream = res;
     
      this.btnLabel = 'Capture Image';
    }).catch(err => {
      console.log(err);
      if (err?.message === 'Permission denied') {
        alert('Permission denied, please try again by approving the access');
        // this.status = 'Permission denied, please try again by approving the access';
      } else {
        // this.status = 'Error accessing camera';
        alert('Error accessing camera');
      }
    });
  }

  // captureImage() {
  //   this.trigger.next();
  // }

  // snapshot(event: WebcamImage) {
  //   console.log(event);
  //   this.previewImage = event.imageAsDataUrl;
  //   this.btnLabel = 'Re-capture Image';
  // }

  startRecording() {
    if (this.stream) {
      this.videoChunks = [];
      this.videoRecorder = new MediaRecorder(this.stream, { mimeType: 'video/webm;codecs=vp9,opus' });
  
      this.videoRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.videoChunks.push(event.data);
        }
      };
  
      this.videoRecorder.onstop = () => {
        const blob = new Blob(this.videoChunks, { type: 'video/webm' });
        this.previewImage = URL.createObjectURL(blob);
        this.btnLabel = 'Re-capture Video';
        this.isRecording = false;
      };
  
      this.videoRecorder.start(1000);
      this.isRecording = true;
    }
  }
  

  stopRecording() {
    if (this.videoRecorder && this.isRecording) {
      this.videoRecorder.stop();
    }
  }
  recaptureVideo() {
    // If recording is ongoing, stop it
    if (this.isRecording) {
      this.stopRecording();
    }
  
    // Reset the previewImage and button labels
    this.previewImage = '';
    this.btnLabel = 'Start Recording';
  
    // Update the recording state
    this.isRecording = false;
  }
  

  downloadVideo() {
    if (this.previewImage) {
      const a = document.createElement('a');
      a.href = this.previewImage;
      a.download = 'recorded-video.webm';
      a.click();
    }
  }

  
  checkPermissions() {
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 500 },
        height: { ideal: 500 }
      },
      audio: true // Request audio permission
    }).then((res) => {
      console.log('response', res);
      this.stream = res;
   
        // Show an alert for permissions granted
    alert('Permissions Granted !');
    }).catch(err => {
      console.log(err);
  
      if (err?.message === 'Permission denied') {
        // this.status = 'Permission denied, please try again by approving the access';
         // Show an alert for permissions denied
      alert('Permission denied, please try again by approving the access');
      } else {
        // this.status = 'No camera available on your device';
        alert('No camera available on your device');
      }
    });
  }
}  
