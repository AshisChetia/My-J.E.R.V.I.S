import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;

class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    static model = 'Xenova/whisper-tiny.en';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            // Removed WebGPU. Falling back to ultra-stable WASM/CPU.
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    if (!event.data || !event.data.audioData) return;

    try {
        const transcriber = await PipelineSingleton.getInstance(x => {
            if (x.status === 'download' && x.progress < 100) {
                 console.log(`Downloading AI: ${Math.round(x.progress)}%`);
            }
        });

        const output = await transcriber(event.data.audioData);
        self.postMessage({ status: 'success', text: output.text });

    } catch (error) {
         // This will now catch any crashes and send them back to the UI
         self.postMessage({ status: 'error', message: error.toString() });
    }
});