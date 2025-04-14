import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Dimensions, Image } from 'react-native';
import { Send, Mic, MicOff, Sparkles } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeOutUp, 
  Layout,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat,
  useSharedValue
} from 'react-native-reanimated';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const { width } = Dimensions.get('window');

const ASSISTANT_IMAGES = {
  default: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=200&fit=crop&q=80',
  thinking: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=200&h=200&fit=crop&q=80',
  speaking: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=200&h=200&fit=crop&q=80',
  listening: 'https://images.unsplash.com/photo-1547407139-3c921a66005c?w=200&h=200&fit=crop&q=80',
};

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('assistant.greeting'),
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [transcript, setTranscript] = useState('');

  const bounceValue = useSharedValue(1);
  const rotateValue = useSharedValue(0);

  useEffect(() => {
    if (isProcessing || isListening) {
      bounceValue.value = withRepeat(
        withSequence(
          withSpring(1.1),
          withSpring(1)
        ),
        -1,
        true
      );
      rotateValue.value = withRepeat(
        withSequence(
          withSpring(-0.1),
          withSpring(0.1)
        ),
        -1,
        true
      );
    } else {
      bounceValue.value = withSpring(1);
      rotateValue.value = withSpring(0);
    }
  }, [isProcessing, isListening]);

  const assistantStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bounceValue.value },
      { rotate: `${rotateValue.value}rad` }
    ]
  }));

  const getAssistantImage = () => {
    if (isProcessing) return ASSISTANT_IMAGES.thinking;
    if (isListening) return ASSISTANT_IMAGES.listening;
    if (isSpeaking) return ASSISTANT_IMAGES.speaking;
    return ASSISTANT_IMAGES.default;
  };

  useEffect(() => {
    return () => {
      if (Platform.OS !== 'web') {
        Speech.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = i18n.language === 'zh' ? 'zh-CN' : 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        if (transcript) {
          sendMessage(transcript);
        }
        setTranscript('');
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setError('Voice input error. Please try again.');
      };

      setRecognition(recognitionInstance);
    }
  }, [i18n.language]);

  const stopSpeaking = useCallback(async () => {
    if (Platform.OS !== 'web') {
      await Speech.stop();
      setIsSpeaking(false);
    }
  }, []);

  const speakMessage = useCallback(async (text: string) => {
    if (Platform.OS !== 'web') {
      try {
        await stopSpeaking();
        setIsSpeaking(true);
        await Speech.speak(text, {
          language: i18n.language,
          rate: 0.9,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      } catch (error) {
        console.error('Speech error:', error);
        setIsSpeaking(false);
      }
    }
  }, [i18n.language, stopSpeaking]);

  const processMessage = useCallback(async (text: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const newUserMessage = { id: Date.now().toString(), role: 'user' as const, content: text };
      setMessages(prev => [...prev, newUserMessage]);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage].map(({ role, content }) => ({ role, content }))
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Expected JSON response but got ' + contentType);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.output?.text) {
        throw new Error('Invalid response format from API');
      }

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.output.text
      };

      setMessages(prev => [...prev, aiResponse]);
      await speakMessage(aiResponse.content);

    } catch (error) {
      console.error('Error processing message:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsProcessing(false);
    }
  }, [messages, speakMessage]);

  const sendMessage = useCallback((text: string) => {
    if (text.trim()) {
      setMessage('');
      processMessage(text.trim());
    }
  }, [processMessage]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      if (Platform.OS === 'web' && recognition) {
        recognition.stop();
      }
      setIsListening(false);
      await stopSpeaking();
    } else {
      if (Platform.OS === 'web') {
        if (recognition) {
          try {
            await recognition.start();
          } catch (error) {
            console.error('Speech recognition error:', error);
            setError('Could not start voice input. Please try again.');
          }
        } else {
          setError('Voice input is not supported in this browser.');
        }
      } else {
        setError('Voice input is not yet supported on mobile platforms.');
      }
    }
  }, [isListening, recognition, stopSpeaking]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7C3AED', '#4F46E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Animated.View 
          entering={FadeInDown.duration(800)}
          style={styles.headerContent}
        >
          <Text style={styles.headerTitle}>{t('common.welcome')}</Text>
          <Text style={styles.headerSubtitle}>{t('common.whereToGo')}</Text>
          
          <Animated.View style={[styles.assistantContainer, assistantStyle]}>
            <Image
              source={{ uri: getAssistantImage() }}
              style={styles.assistantImage}
            />
            <LinearGradient
              colors={['rgba(124, 58, 237, 0)', 'rgba(124, 58, 237, 0.2)']}
              style={styles.assistantShadow}
            />
          </Animated.View>
        </Animated.View>
      </LinearGradient>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.messagesContent}
      >
        {error && (
          <Animated.View 
            entering={FadeInDown}
            exiting={FadeOutUp}
            style={styles.errorContainer}
          >
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}
        
        {messages.map((msg) => (
          <Animated.View
            key={msg.id}
            entering={FadeInDown}
            layout={Layout.springify()}
            style={[
              styles.messageBox,
              msg.role === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}>
            <Text style={[
              styles.messageText,
              msg.role === 'assistant' && styles.assistantMessageText
            ]}>{msg.content}</Text>
            {msg.role === 'assistant' && (
              <View style={styles.messageTail} />
            )}
          </Animated.View>
        ))}

        {transcript && (
          <Animated.View
            entering={FadeInDown}
            style={styles.transcriptContainer}
          >
            <Text style={styles.transcriptText}>{transcript}</Text>
          </Animated.View>
        )}
        
        {isProcessing && (
          <Animated.View 
            entering={FadeInDown}
            style={styles.processingContainer}
          >
            <ActivityIndicator color="#7C3AED" />
            <Text style={styles.processingText}>Processing your request...</Text>
          </Animated.View>
        )}
      </ScrollView>

      <Animated.View 
        entering={FadeInDown}
        style={styles.inputWrapper}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.8)', '#FFFFFF']}
          style={styles.inputGradient}
        >
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={[
                styles.micButton, 
                isListening && styles.micButtonActive,
                isSpeaking && styles.micButtonSpeaking
              ]}
              onPress={isSpeaking ? stopSpeaking : toggleListening}
              disabled={isProcessing}
            >
              {isListening ? (
                <MicOff size={24} color="#EF4444" />
              ) : (
                <Mic size={24} color={isSpeaking ? "#3B82F6" : "#7C3AED"} />
              )}
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder={t('assistant.placeholder')}
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={500}
              editable={!isProcessing}
            />
            
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                (!message.trim() || isProcessing) && styles.sendButtonDisabled
              ]}
              onPress={() => sendMessage(message)}
              disabled={isProcessing || !message.trim()}
            >
              <Send size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    position: 'relative',
    alignItems: 'center',
    paddingBottom: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#E2E8F0',
    opacity: 0.9,
  },
  headerDecoration: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  assistantContainer: {
    position: 'absolute',
    bottom: -40,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  assistantImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  assistantShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageBox: {
    maxWidth: width * 0.75,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  userMessage: {
    backgroundColor: '#7C3AED',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageTail: {
    position: 'absolute',
    left: -8,
    bottom: 0,
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  messageText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  assistantMessageText: {
    color: '#1E293B',
  },
  inputWrapper: {
    backgroundColor: 'transparent',
  },
  inputGradient: {
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    marginHorizontal: 12,
    padding: 12,
    paddingTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 100,
  },
  micButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  micButtonActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  micButtonSpeaking: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  sendButton: {
    backgroundColor: '#7C3AED',
    padding: 12,
    borderRadius: 24,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  processingText: {
    marginLeft: 12,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  transcriptContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  transcriptText: {
    color: '#4B5563',
    fontSize: 14,
    fontStyle: 'italic',
  },
});