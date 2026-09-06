import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  PhoneCall, 
  PhoneOff, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Bot, 
  ShieldCheck, 
  Building, 
  Calendar, 
  AlertCircle,
  MessageSquare,
  Radio,
  Send,
  Languages,
  Database,
  User,
  History,
  X,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { COMPANY_DETAILS } from '../data/properties';
import { useAuth } from '../contexts/AuthContext';
import { logVoiceSessionToSupabase, getVoiceSessionsFromSupabase, VoiceSessionRecord } from '../lib/supabase';

interface LiveVoiceAdvisorProps {
  onOpenBooking?: (propertyName?: string) => void;
  onSwitchToChat?: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  isCompact?: boolean;
}

// Convert Float32Array PCM to 16-bit PCM ArrayBuffer and then Base64
function float32ToPcm16Base64(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 16-bit PCM little-endian back to Float32Array for 24kHz Web Audio playback
function base64ToFloat32Pcm(base64: string): Float32Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 32768 : 32767);
  }
  return float32Array;
}

const HINGLISH_QUICK_QUESTIONS = [
  {
    title: 'Nagpur Growth Potential',
    hinglish: 'Nagpur mein property invest karne ke kya advantages hain?',
    english: 'Why invest in Nagpur real estate right now?',
  },
  {
    title: 'MahaRERA & Legal Safety',
    hinglish: 'AS Realty legal title aur MahaRERA verification kaise karta hai?',
    english: 'How do you verify 30-year titles and MahaRERA compliance?',
  },
  {
    title: 'Luxury Penthouses',
    hinglish: 'Civil Lines aur Dharampeth mein ready penthouses kaunse hain?',
    english: 'Tell me about luxury penthouses in Civil Lines & Dharampeth.',
  },
  {
    title: 'Sanctioned Land Plots',
    hinglish: 'Besa aur MIHAN mein NMRDA sanctioned plots ka kya rate hai?',
    english: 'Show me NMRDA/RL sanctioned plots in Besa & MIHAN corridor.',
  },
];

export const LiveVoiceAdvisor: React.FC<LiveVoiceAdvisorProps> = ({
  onOpenBooking,
  onSwitchToChat,
  onOpenAuth,
  isCompact = false,
}) => {
  const { user } = useAuth();
  const [voiceEngine, setVoiceEngine] = useState<'live-websocket' | 'serverless-voice'>('live-websocket');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'closed'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isAdvisorSpeaking, setIsAdvisorSpeaking] = useState(false);
  const [userSpeechVolume, setUserSpeechVolume] = useState(0);
  const [advisorTranscript, setAdvisorTranscript] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [pastSessions, setPastSessions] = useState<VoiceSessionRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const defaultGreeting = user?.fullName
    ? `Namaste ${user.fullName.split(' ')[0]} ji! Main AS Realty ka Senior Luxury Property Advisor hoon. Amit Shivpeth ji ke guidance mein hum Nagpur ke top luxury penthouses, sanctioned plots aur farm estates provide karte hain. Aap kis tarah ki property explore karna chahte hain?`
    : 'Namaste! Main AS Realty ka Senior Luxury Property Advisor hoon. Amit Shivpeth ji ke guidance mein hum Nagpur ke top luxury penthouses, sanctioned plots aur farm estates provide karte hain. Aap kis tarah ki property explore karna chahte hain?';

  const [transcriptHistory, setTranscriptHistory] = useState<Array<{ sender: 'user' | 'advisor'; text: string; time: string }>>([
    {
      sender: 'advisor',
      text: defaultGreeting,
      time: 'Just now',
    },
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isProcessingServerless, setIsProcessingServerless] = useState(false);

  const handleOpenHistory = async () => {
    setShowHistoryModal(true);
    setIsLoadingHistory(true);
    const data = await getVoiceSessionsFromSupabase(user?.id);
    setPastSessions(data);
    setIsLoadingHistory(false);
  };

  // Audio Context and Stream References
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef(false);
  const isSpeakerMutedRef = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Serverless Voice (Web Speech API) References
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const currentSpeechBufferRef = useRef<string>('');

  isMutedRef.current = isMuted;
  isSpeakerMutedRef.current = isSpeakerMuted;

  // Auto scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptHistory, advisorTranscript]);

  // Stop browser speech synthesis if active
  const stopSpeechSynthesis = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAdvisorSpeaking(false);
  };

  // Speak text aloud using Web SpeechSynthesis in Indian English / Hindi voice
  const speakWithSynthesis = (textToSpeak: string) => {
    if (isSpeakerMutedRef.current) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();

      // Strip markdown asterisks and bullets for smooth spoken audio
      const cleanSpoken = textToSpeak
        .replace(/[*_#`•]/g, '')
        .replace(/\n\s*\n/g, '. ')
        .trim();

      if (!cleanSpoken) return;

      const utterance = new SpeechSynthesisUtterance(cleanSpoken);
      const voices = window.speechSynthesis.getVoices();

      // Find natural Indian English or Hindi voice
      const preferredVoice =
        voices.find((v) => v.lang === 'hi-IN' || v.lang === 'en-IN') ||
        voices.find((v) => v.name.toLowerCase().includes('india')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsAdvisorSpeaking(true);
      };

      utterance.onend = () => {
        setIsAdvisorSpeaking(false);
      };

      utterance.onerror = () => {
        setIsAdvisorSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('[SpeechSynthesis] Error speaking text:', e);
      setIsAdvisorSpeaking(false);
    }
  };

  // Clean up all audio nodes and websocket
  const stopAllPlayback = () => {
    stopSpeechSynthesis();

    for (const source of activeSourcesRef.current) {
      try {
        source.stop();
        source.disconnect();
      } catch (_) {}
    }
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
    setIsAdvisorSpeaking(false);
  };

  const disconnectSession = () => {
    stopAllPlayback();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch (_) {}
      scriptProcessorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current && outputAudioCtxRef.current.state !== 'closed') {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionStatus('closed');
    setUserSpeechVolume(0);
    setIsProcessingServerless(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSession();
    };
  }, []);

  // Play audio chunk at 24000Hz (Live API Output)
  const playAudioChunk = (base64Audio: string) => {
    if (isSpeakerMutedRef.current) return;

    try {
      if (!outputAudioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        outputAudioCtxRef.current = new AudioContextClass({ sampleRate: 24000 });
      }

      const audioCtx = outputAudioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const float32Pcm = base64ToFloat32Pcm(base64Audio);
      if (!float32Pcm || float32Pcm.length === 0) return;

      const audioBuffer = audioCtx.createBuffer(1, float32Pcm.length, 24000);
      audioBuffer.copyToChannel(float32Pcm, 0);

      const sourceNode = audioCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime + 0.04; // 40ms buffer to absorb jitter
      }

      sourceNode.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;

      activeSourcesRef.current.push(sourceNode);
      setIsAdvisorSpeaking(true);

      sourceNode.onended = () => {
        const idx = activeSourcesRef.current.indexOf(sourceNode);
        if (idx > -1) {
          activeSourcesRef.current.splice(idx, 1);
        }
        if (activeSourcesRef.current.length === 0) {
          setIsAdvisorSpeaking(false);
        }
      };
    } catch (err) {
      console.error('Failed to play audio chunk:', err);
    }
  };

  // Serverless Voice Process: Sends user Hinglish text to /api/chat and speaks back
  const processServerlessQuery = async (queryText: string) => {
    if (!queryText.trim() || isProcessingServerless) return;

    setIsProcessingServerless(true);
    setAdvisorTranscript('AS Realty Advisor analyzing Nagpur market data...');

    // Add user query to transcript
    setTranscriptHistory((h) => [
      ...h,
      { sender: 'user', text: queryText.trim(), time: 'Just now' },
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText.trim(),
          modelSpeed: 'fast',
          history: transcriptHistory.slice(-4),
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to reach advisor`);
      }

      const data = await res.json();
      const reply = data.reply || 'Namaste! AS Realty Nagpur luxury advisory mein aapka swagat hai.';

      setAdvisorTranscript('');
      setTranscriptHistory((h) => [
        ...h,
        { sender: 'advisor', text: reply, time: 'Just now' },
      ]);

      // Log voice interaction to Supabase backend asynchronously
      logVoiceSessionToSupabase({
        user_id: user?.id || null,
        user_email: user?.email || null,
        user_name: user?.fullName || 'Client',
        query_text: queryText.trim(),
        response_text: reply,
        voice_engine: 'serverless-voice',
      });

      // Speak answer back in Hinglish
      speakWithSynthesis(reply);
    } catch (err: any) {
      console.error('[Serverless Voice] Query error:', err);
      const fallbackMsg =
        'AS Realty Amit Shivpeth ji ke leadership mein 100% MahaRERA verified properties offer karta hai. WhatsApp par connect karein: +91 87883 75434.';
      setAdvisorTranscript('');
      setTranscriptHistory((h) => [
        ...h,
        { sender: 'advisor', text: fallbackMsg, time: 'Just now' },
      ]);
      speakWithSynthesis(fallbackMsg);
    } finally {
      setIsProcessingServerless(false);
    }
  };

  // Start Serverless Voice (Vercel-Friendly) using Web Speech API + /api/chat + SpeechSynthesis
  const startServerlessVoiceSession = async () => {
    setErrorMessage(null);
    setVoiceEngine('serverless-voice');
    setConnectionStatus('connecting');

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setConnectionStatus('connected');
      setErrorMessage(
        'Browser Speech Recognition is not available. You can speak or type in Hinglish using the input box below, and the Advisor will speak back aloud!'
      );
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      // hi-IN natively handles Hinglish spoken input
      recognition.lang = 'hi-IN';

      recognition.onstart = () => {
        setConnectionStatus('connected');
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        if (isMutedRef.current) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptChunk;
          } else {
            interimTranscript += transcriptChunk;
          }
        }

        const activeText = finalTranscript || interimTranscript;
        if (activeText) {
          setUserSpeechVolume(Math.min(100, Math.round(activeText.length * 5)));
          currentSpeechBufferRef.current = activeText;
        }

        // On speech pause/silence threshold, trigger query processing
        if (finalTranscript.trim()) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            const queryToSend = currentSpeechBufferRef.current;
            currentSpeechBufferRef.current = '';
            setUserSpeechVolume(0);
            if (queryToSend.trim()) {
              processServerlessQuery(queryToSend);
            }
          }, 1200);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('[Serverless Voice] Speech recognition note:', e.error);
        if (e.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions to speak.');
          setConnectionStatus('error');
        }
      };

      recognition.onend = () => {
        // Auto-restart if still connected and not muted
        if (connectionStatus === 'connected' && recognitionRef.current) {
          try {
            recognition.start();
          } catch (_) {}
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error('[Serverless Voice] Init failed:', err);
      setConnectionStatus('connected');
    }
  };

  // Start live session (Auto-fallback to Serverless Voice if WebSockets unavailable on Vercel)
  const startSession = async () => {
    setErrorMessage(null);
    setConnectionStatus('connecting');
    setAdvisorTranscript('');

    if (voiceEngine === 'serverless-voice') {
      await startServerlessVoiceSession();
      return;
    }

    try {
      // 1. Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        // Fallback directly to serverless voice
        console.log('[Live Voice] AudioContext not available, falling back to Serverless Voice');
        await startServerlessVoiceSession();
        return;
      }

      // 16kHz for microphone input (required by Gemini Live API)
      inputAudioCtxRef.current = new AudioContextClass({ sampleRate: 16000 });
      // 24kHz for Live API response output
      outputAudioCtxRef.current = new AudioContextClass({ sampleRate: 24000 });

      await inputAudioCtxRef.current.resume();
      await outputAudioCtxRef.current.resume();

      // 2. Request user microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });
      mediaStreamRef.current = stream;

      // 3. Setup WebSocket connection to server /api/live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      let hasOpened = false;

      ws.onopen = () => {
        hasOpened = true;
        console.log('[Live Voice Client] WebSocket connected to /api/live');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'status' && msg.status === 'ready') {
            setConnectionStatus('connected');
          } else if (msg.type === 'audio' && msg.audio) {
            playAudioChunk(msg.audio);
          } else if (msg.type === 'interrupted') {
            stopAllPlayback();
          } else if (msg.type === 'text' && msg.text) {
            setAdvisorTranscript((prev) => {
              const updated = prev ? prev + ' ' + msg.text : msg.text;
              return updated;
            });
          } else if (msg.type === 'turnComplete') {
            setAdvisorTranscript((curr) => {
              if (curr.trim()) {
                setTranscriptHistory((h) => [
                  ...h,
                  { sender: 'advisor', text: curr.trim(), time: 'Just now' },
                ]);

                // Log live audio stream consultation to Supabase backend asynchronously
                logVoiceSessionToSupabase({
                  user_id: user?.id || null,
                  user_email: user?.email || null,
                  user_name: user?.fullName || 'Client',
                  query_text: 'Live Audio Stream Consultation',
                  response_text: curr.trim(),
                  voice_engine: 'live-websocket',
                });
              }
              return '';
            });
          } else if (msg.type === 'error') {
            console.error('[Live Voice Client] Server error message:', msg.error);
            setErrorMessage(msg.error || 'Connection error with Live Advisor.');
            setConnectionStatus('error');
          }
        } catch (e) {
          console.error('[Live Voice Client] Error parsing ws message:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('[Live Voice Client] WebSocket unavailable (Vercel Serverless environment detected):', err);
        // Seamless Vercel Fallback: If WebSocket fails, switch to Vercel Serverless Voice engine automatically!
        if (!hasOpened) {
          console.log('[Live Voice Client] Automatically switching to Vercel Serverless Voice Mode...');
          setVoiceEngine('serverless-voice');
          startServerlessVoiceSession();
        } else {
          setErrorMessage('Live stream disconnected. Switched to Vercel Voice Mode.');
          setVoiceEngine('serverless-voice');
          startServerlessVoiceSession();
        }
      };

      ws.onclose = () => {
        console.log('[Live Voice Client] WebSocket closed');
        if (!hasOpened && voiceEngine === 'live-websocket') {
          // If connection closed immediately before open, fallback to serverless
          setVoiceEngine('serverless-voice');
          startServerlessVoiceSession();
        } else if (connectionStatus === 'connected') {
          setConnectionStatus('closed');
        }
      };

      // 4. Hook microphone audio pipeline with ScriptProcessor
      const source = inputAudioCtxRef.current.createMediaStreamSource(stream);
      const processor = inputAudioCtxRef.current.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(inputAudioCtxRef.current.destination);

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current) {
          setUserSpeechVolume(0);
          return;
        }

        const inputBuffer = e.inputBuffer.getChannelData(0);

        // Calculate simple volume level for visualizer
        let sum = 0;
        for (let i = 0; i < inputBuffer.length; i++) {
          sum += inputBuffer[i] * inputBuffer[i];
        }
        const rms = Math.sqrt(sum / inputBuffer.length);
        setUserSpeechVolume(Math.min(100, Math.round(rms * 400)));

        // Only send if connected and socket is open
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const base64Pcm16 = float32ToPcm16Base64(inputBuffer);
          wsRef.current.send(JSON.stringify({ audio: base64Pcm16 }));
        }
      };
    } catch (err: any) {
      console.warn('[Live Voice Advisor] WebSocket setup error, switching to Vercel Serverless Voice:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser to speak with the Live Advisor.');
        setConnectionStatus('error');
      } else {
        // Fallback to Serverless Voice
        setVoiceEngine('serverless-voice');
        await startServerlessVoiceSession();
      }
    }
  };

  // Send typed query or quick question into live or serverless session
  const sendTextQuery = (text: string) => {
    if (!text.trim()) return;

    if (voiceEngine === 'serverless-voice' || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      // Use Serverless Voice engine
      processServerlessQuery(text.trim());
      setTextInput('');
      return;
    }

    setTranscriptHistory((h) => [
      ...h,
      { sender: 'user', text: text.trim(), time: 'Just now' },
    ]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: text.trim() }));
    }

    setTextInput('');
  };

  return (
    <div className={`w-full flex flex-col bg-[#001730] border border-[#C5A059]/40 rounded-2xl shadow-2xl overflow-hidden ${isCompact ? 'p-4' : 'p-6'}`}>
      {/* Top Header & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#C5A059]/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-[#002347] border border-[#E6C687]/60 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-[#E6C687]" />
            </div>
            {connectionStatus === 'connected' && (
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-serif-luxury tracking-wide">
                AS Realty Live Voice Advisor
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#C5A059]/20 text-[#E6C687] border border-[#C5A059]/40">
                Professional Hinglish
              </span>
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3 h-3 text-[#E6C687]" />
              <span>
                {voiceEngine === 'serverless-voice'
                  ? 'Vercel Serverless Voice • Web Speech API + Gemini'
                  : 'Live Audio Stream • gemini-3.1-flash-live-preview'}
              </span>
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Supabase Connection Status Pill */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#001730] border border-emerald-500/40 text-emerald-300 shadow-sm"
            title="Supabase Backend: Project Mwyudzasqktveuqmdxjb (Voice sessions and lead inquiries synced)"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Supabase:</span>
            <span>Synced</span>
          </div>

          {/* Consultation History Button */}
          <button
            onClick={handleOpenHistory}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#002347] hover:bg-[#001730] border border-[#C5A059]/40 text-[#E6C687] transition-all cursor-pointer"
            title="View voice consultation sessions stored in Supabase"
          >
            <History className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="hidden md:inline">Saved Sessions</span>
          </button>

          {/* User Status / Sign In Button */}
          {user ? (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#001730] border border-[#C5A059]/50 text-[#E6C687]"
              title={`Logged in as ${user.fullName || user.email}`}
            >
              <User className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="max-w-[90px] truncate">{user.fullName?.split(' ')[0] || 'Client'}</span>
              {user.isGuest && (
                <span className="text-[9px] px-1 py-0.5 bg-white/10 text-slate-300 rounded">Guest</span>
              )}
            </div>
          ) : (
            onOpenAuth && (
              <button
                onClick={() => onOpenAuth('signin')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#C5A059] to-[#E6C687] text-[#002347] hover:from-[#B8924B] hover:to-[#D9B97A] font-bold transition-all cursor-pointer"
                title="Sign in or create account to save your consultations"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )
          )}

          {/* Vercel Mode Toggle Pill */}
          <button
            onClick={() => {
              disconnectSession();
              setVoiceEngine((curr) =>
                curr === 'serverless-voice' ? 'live-websocket' : 'serverless-voice'
              );
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              voiceEngine === 'serverless-voice'
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                : 'bg-[#002347] border-[#C5A059]/40 text-[#E6C687] hover:bg-[#001730]'
            }`}
            title="Toggle between Vercel Serverless Voice and Live WebSocket"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                voiceEngine === 'serverless-voice' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span>
              {voiceEngine === 'serverless-voice' ? 'Vercel Voice' : 'WebSocket'}
            </span>
          </button>

          {onSwitchToChat && (
            <button
              onClick={onSwitchToChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#002347] hover:bg-[#001730] border border-[#C5A059]/40 text-xs font-semibold text-[#E6C687] transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#E6C687]" />
              <span>Text</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#001224] border border-white/10 text-slate-300">
            <Languages className="w-3 h-3 text-[#C5A059]" />
            <span>Hinglish</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Orb & Visualizer Area */}
      <div className="py-8 flex flex-col items-center justify-center text-center relative">
        {/* Ambient Glowing Halo */}
        <div className={`absolute w-64 h-64 rounded-full filter blur-3xl transition-all duration-700 pointer-events-none ${
          isAdvisorSpeaking 
            ? 'bg-[#C5A059]/25 scale-125' 
            : connectionStatus === 'connected' 
              ? 'bg-emerald-500/15 scale-100' 
              : 'bg-blue-600/10 scale-90'
        }`} />

        {/* Central Interactive Voice Orb Button */}
        <div className="relative mb-6">
          {/* Animated Pulsing Rings when Live */}
          {connectionStatus === 'connected' && (
            <>
              <div 
                className="absolute inset-0 -m-3 rounded-full border border-[#E6C687]/40 animate-ping opacity-30" 
                style={{ animationDuration: isAdvisorSpeaking ? '1.2s' : '2.5s' }}
              />
              <div 
                className="absolute inset-0 -m-6 rounded-full border border-[#C5A059]/30 animate-pulse opacity-40"
              />
            </>
          )}

          <button
            onClick={() => {
              if (connectionStatus === 'connected') {
                disconnectSession();
              } else {
                startSession();
              }
            }}
            disabled={connectionStatus === 'connecting'}
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-2xl cursor-pointer ${
              connectionStatus === 'connected'
                ? isAdvisorSpeaking
                  ? 'bg-gradient-to-tr from-[#C5A059] via-[#D4AF37] to-[#E6C687] text-[#002347] border-4 border-[#FFF5DC] shadow-[#C5A059]/40 ring-4 ring-[#E6C687]/50'
                  : 'bg-gradient-to-tr from-[#002347] to-[#001730] text-[#E6C687] border-2 border-[#E6C687] shadow-emerald-500/20'
                : connectionStatus === 'connecting'
                  ? 'bg-[#002347] text-[#E6C687] border-2 border-[#C5A059] animate-pulse cursor-wait'
                  : 'bg-gradient-to-tr from-[#C5A059] via-[#D4AF37] to-[#E6C687] hover:from-[#D4AF37] hover:to-[#FFF0C8] text-[#002347] border-2 border-[#E6C687] shadow-xl shadow-[#C5A059]/30 hover:scale-105'
            }`}
            title={connectionStatus === 'connected' ? 'Disconnect Voice Session' : 'Start Live Hinglish Voice Session'}
          >
            {connectionStatus === 'connected' ? (
              <>
                {isAdvisorSpeaking ? (
                  <Volume2 className="w-9 h-9 text-[#002347] animate-bounce" />
                ) : isMuted ? (
                  <MicOff className="w-8 h-8 text-rose-400" />
                ) : (
                  <Mic className="w-8 h-8 text-emerald-400 animate-pulse" />
                )}
                <span className="text-[11px] font-bold uppercase tracking-wider mt-1.5">
                  {isAdvisorSpeaking ? 'Speaking' : isMuted ? 'Muted' : 'Listening'}
                </span>
              </>
            ) : connectionStatus === 'connecting' ? (
              <>
                <Radio className="w-8 h-8 animate-spin text-[#E6C687]" />
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1.5">
                  Connecting
                </span>
              </>
            ) : (
              <>
                <Mic className="w-9 h-9 text-[#002347]" />
                <span className="text-xs font-bold uppercase tracking-wider mt-1.5">
                  Start Voice
                </span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#001224] border border-[#C5A059]/40 text-xs font-medium text-slate-200 shadow-inner">
          <span className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected'
              ? isAdvisorSpeaking
                ? 'bg-[#E6C687] animate-ping'
                : 'bg-emerald-400 animate-pulse'
              : connectionStatus === 'connecting'
                ? 'bg-amber-400 animate-spin'
                : 'bg-slate-400'
          }`} />

          <span>
            {connectionStatus === 'connected'
              ? isProcessingServerless
                ? 'Advisor calculating Nagpur property insights...'
                : isAdvisorSpeaking
                  ? 'Advisor is speaking in Hinglish...'
                  : isMuted
                    ? 'Microphone muted (click unmute to speak)'
                    : voiceEngine === 'serverless-voice'
                      ? 'Listening in Hinglish... (Speak or click any topic below)'
                      : 'Listening live... Aap Hindi ya English mein bol sakte hain'
              : connectionStatus === 'connecting'
                ? voiceEngine === 'serverless-voice'
                  ? 'Connecting to Vercel Serverless Voice Advisor...'
                  : 'Initializing 16kHz/24kHz Live Gemini Session...'
                : 'Tap orb to start voice consultation with AS Realty Advisor'}
          </span>
        </div>

        {/* Audio Waveform Equalizer Bars */}
        {connectionStatus === 'connected' && (
          <div className="flex items-center justify-center gap-1.5 mt-4 h-6">
            {[40, 75, 95, 60, 85, 100, 70, 90, 50, 80, 65, 45].map((height, i) => {
              const activeHeight = isAdvisorSpeaking 
                ? `${height}%` 
                : `${Math.max(15, Math.min(100, userSpeechVolume * (height / 60)))}%`;
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    isAdvisorSpeaking ? 'bg-[#E6C687]' : 'bg-emerald-400'
                  }`}
                  style={{ height: activeHeight }}
                />
              );
            })}
          </div>
        )}

        {/* Action Controls Bar */}
        {connectionStatus === 'connected' && (
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                isMuted
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  : 'bg-[#002347] border-[#C5A059]/40 text-slate-200 hover:text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
            </button>

            <button
              onClick={() => {
                setIsSpeakerMuted(!isSpeakerMuted);
                if (!isSpeakerMuted) stopAllPlayback();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                isSpeakerMuted
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                  : 'bg-[#002347] border-[#C5A059]/40 text-slate-200 hover:text-white'
              }`}
            >
              {isSpeakerMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeakerMuted ? 'Muted Audio' : 'Audio On'}</span>
            </button>

            <button
              onClick={disconnectSession}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End Call</span>
            </button>
          </div>
        )}

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="mt-4 max-w-lg p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs text-left flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-100">Live Voice Notification</p>
              <p className="mt-0.5 text-rose-200 leading-relaxed">{errorMessage}</p>
              <p className="mt-1 text-[11px] text-rose-300/90">
                You can also type your message below or switch to the text consultation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Live Transcript & History */}
      <div className="mt-2 rounded-xl bg-[#001224]/90 border border-[#C5A059]/30 p-4 max-h-56 overflow-y-auto space-y-3">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10 font-semibold">
          <span>Live Conversation Transcript</span>
          <span className="text-[#E6C687]">Bilingual (Hinglish / English)</span>
        </div>

        {transcriptHistory.map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-3 text-xs sm:text-sm leading-relaxed ${
                item.sender === 'user'
                  ? 'bg-gradient-to-r from-[#002347] to-[#001730] border border-[#E6C687]/40 text-white'
                  : 'bg-[#002347]/90 border border-[#C5A059]/40 text-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#E6C687] font-semibold">
                {item.sender === 'user' ? (
                  <span>You (Voice/Text)</span>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-[#E6C687]" />
                    <span>AS Realty Senior Advisor (Hinglish)</span>
                  </>
                )}
              </div>
              <p className="whitespace-pre-line">{item.text}</p>
            </div>
          </div>
        ))}

        {/* Live In-Progress Transcript from Model */}
        {advisorTranscript && (
          <div className="flex flex-col items-start animate-fadeIn">
            <div className="max-w-[85%] rounded-xl p-3 text-xs sm:text-sm leading-relaxed bg-[#002347] border border-[#E6C687] text-white shadow-lg">
              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#E6C687] font-semibold">
                <Bot className="w-3 h-3 text-[#E6C687] animate-spin" />
                <span>AS Realty Senior Advisor (Live Speech)</span>
              </div>
              <p className="whitespace-pre-line">{advisorTranscript}</p>
            </div>
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>

      {/* Suggested Hinglish Topics to Speak or Click */}
      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#E6C687]" />
          <span>Recommended Hinglish Questions (Aap pooch sakte hain):</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {HINGLISH_QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendTextQuery(q.hinglish)}
              className="text-left p-2.5 rounded-xl bg-[#001224] hover:bg-[#002347] border border-[#C5A059]/30 hover:border-[#E6C687] transition-all group cursor-pointer"
            >
              <p className="text-xs font-semibold text-white group-hover:text-[#E6C687]">
                "{q.hinglish}"
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {q.english}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Fallback Text Input in Voice Room */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendTextQuery(textInput);
            }
          }}
          placeholder="Speak or type your question in Hinglish (e.g., Civil Lines penthouses ke rate kya hain?)..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#001224] border border-[#C5A059]/40 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#E6C687]"
        />

        <button
          onClick={() => sendTextQuery(textInput)}
          disabled={!textInput.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#E6C687] hover:from-[#B8924B] hover:to-[#D9B97A] text-[#002347] font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="Send message to Live Advisor"
        >
          <Send className="w-4 h-4" />
        </button>

        {onOpenBooking && (
          <button
            onClick={() => onOpenBooking()}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider shadow transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>VIP Site Visit</span>
          </button>
        )}
      </div>

      {/* Trust Footer */}
      <div className="mt-3 text-[11px] text-slate-400 text-center flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#E6C687]" />
        <span>Official AS Realty AI Advisory • Directed by Amit Shivpeth • 100% MahaRERA Verified</span>
      </div>

      {/* Supabase Saved Consultations Modal */}
      {showHistoryModal && (
        <div
          id="supabase-history-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001730]/85 backdrop-blur-md animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHistoryModal(false);
          }}
        >
          <div className="relative w-full max-w-lg bg-[#002347] border border-[#C5A059]/40 rounded-2xl shadow-2xl p-6 text-white max-h-[80vh] flex flex-col animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#001730] border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif-luxury text-base sm:text-lg font-bold text-white">
                    Supabase Voice Consultations
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Project: <span className="font-mono text-[#E6C687]">Mwyudzasqktveuqmdxjb</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {isLoadingHistory ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Loading consultations from Supabase...</span>
                </div>
              ) : pastSessions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Sparkles className="w-8 h-8 text-[#C5A059]/40 mx-auto mb-2" />
                  <p className="font-semibold text-slate-300">No previous voice sessions recorded yet.</p>
                  <p className="mt-1 text-slate-400">
                    Speak or ask a question with the AI Voice Advisor to record your first consultation.
                  </p>
                </div>
              ) : (
                pastSessions.map((session, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#001730] border border-white/10 hover:border-[#C5A059]/50 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-[#E6C687]">
                        <User className="w-3 h-3" />
                        <span>{session.user_name || 'Client'}</span>
                      </span>
                      <span>
                        {session.created_at
                          ? new Date(session.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Recent'}
                      </span>
                    </div>

                    <div className="mb-2">
                      <p className="font-semibold text-slate-200">
                        Q: "{session.query_text}"
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#002347] border border-white/5 text-slate-300 text-[11px] leading-relaxed">
                      <span className="text-[#C5A059] font-bold mr-1">Advisor:</span>
                      <span>{session.response_text}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer note */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Backend Live & Synchronized</span>
              </span>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
