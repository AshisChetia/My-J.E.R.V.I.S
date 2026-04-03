import { pipeline, env } from '@xenova/transformers';

// Disable local models to pull from the Hugging Face hub on first run
env.allowLocalModels = false;

class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    static model = 'Xenova/whisper-tiny.en';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

// Listen for messages from the main React thread
// Listen for messages from the main React thread
// Listen for messages from the main React thread
self.addEventListener('message', async (event) => {
    // THE FIX: Ignore Vite's hidden pings. Only proceed if we have audioData.
    if (!event.data || !event.data.audioData) return;

    const { audioData } = event.data;

    try {
        const transcriber = await PipelineSingleton.getInstance(x => {
            // Clean up the console: Only log actual downloading, ignore the instant cache checks
            if (x.status === 'download' && x.progress < 100) {
                 console.log(`Downloading AI Brain: ${Math.round(x.progress)}%`);
            }
        });

        // Run the raw audio data through the Whisper model
        const output = await transcriber(audioData);

        // Send the transcribed text back to React
        self.postMessage({ status: 'success', text: output.text });

    } catch (error) {
         self.postMessage({ status: 'error', message: error.toString() });
    }
});