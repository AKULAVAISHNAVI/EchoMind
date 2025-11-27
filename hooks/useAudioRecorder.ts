
import { useState, useRef } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (isRecording) return;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Media Devices API not supported.");
        alert("Your browser does not support audio recording.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      audioChunksRef.current = [];
      
      const mimeTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4', // Safari support
          'audio/ogg;codecs=opus'
      ];
      
      let selectedMimeType = '';
      for (const type of mimeTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
              selectedMimeType = type;
              break;
          }
      }

      // OPTIMIZATION: Set bitrate to 64kbps (64000 bits/sec) to reduce file size
      // while maintaining good enough quality for speech recognition.
      const options: MediaRecorderOptions = {
          audioBitsPerSecond: 64000 
      };
      
      if (selectedMimeType) {
          options.mimeType = selectedMimeType;
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start(1000); // Slice into 1-second chunks to ensure data availability

    } catch (err) {
      console.error("Error starting audio recording:", err);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
          alert("Microphone permission denied. Please allow microphone access in your browser settings to record your dream.");
      }
      setIsRecording(false);
    }
  };

  const stopRecording = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
        if (!mediaRecorderRef.current || !isRecording) {
            resolve(null);
            return;
        }

        mediaRecorderRef.current.onstop = () => {
            // Determine the mime type from the recorder or fallback
            const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            
            // Stop all tracks to release microphone
            mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            resolve(audioBlob);
        };
        
        mediaRecorderRef.current.stop();
    });
  };

  return { isRecording, startRecording, stopRecording };
};
