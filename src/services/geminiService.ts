import { GoogleGenAI, Chat, Modality } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  private currentAudioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  private initChat() {
    this.chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.6,
      },
    });
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.chat) this.initChat();
    try {
      const result = await this.chat!.sendMessage({ message });
      return (result.text || "")
        .replace(/<[^>]*>?/gm, '') // Remove HTML tags
        .trim();
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Désolé, une erreur technique est survenue. Nos experts Makeda restent à votre disposition.";
    }
  }

  async extractUserInfo(message: string): Promise<{ name?: string; project?: string }> {
    try {
      const prompt = `Extrais le nom de l'utilisateur et son projet d'investissement (ex: retraite, immobilier, éducation, mariage) de ce message : "${message}". Réponds uniquement en JSON format: {"name": "...", "project": "..."}. Si non trouvé, mets null.`;
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      return {
        name: data.name !== "null" ? data.name : undefined,
        project: data.project !== "null" ? data.project : undefined
      };
    } catch (error) {
      console.error("Extraction Error:", error);
      return {};
    }
  }

  async generateSpeech(text: string): Promise<string | undefined> {
    try {
      const speechText = text.replace(/\*\*/g, '').substring(0, 1000);
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: speechText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
      console.error("TTS Error:", error);
      return undefined;
    }
  }

  stopAudio() {
    if (this.currentSource) { 
      try { 
        this.currentSource.stop(); 
      } catch (error) {
        console.error("Error stopping audio source:", error);
      } 
      this.currentSource = null; 
    }
    if (this.currentAudioContext) { 
      this.currentAudioContext.close().catch((error) => {
        console.error("Error closing audio context:", error);
      }); 
      this.currentAudioContext = null; 
    }
  }

  async playBase64Audio(base64: string) {
    this.stopAudio();
    try {
      this.currentAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await this.decodeAudioData(this.decode(base64), this.currentAudioContext, 24000, 1);
      this.currentSource = this.currentAudioContext.createBufferSource();
      this.currentSource.buffer = audioBuffer;
      this.currentSource.connect(this.currentAudioContext.destination);
      this.currentSource.start(0);
    } catch (err) { console.error("Audio Playback Error:", err); }
  }

  private decode(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  }
}

export const geminiService = new GeminiService();
