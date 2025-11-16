import { useState, useRef } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (isRecording) return;
    try {
      // FIX: Check for mediaDevices support.
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Media Devices API not supported.");
        alert("Your browser does not support audio recording.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      audioChunksRef.current = [];
      
      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();

    } catch (err) {
      console.error("Error starting audio recording:", err);
      // Handle permission denied error
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
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
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
