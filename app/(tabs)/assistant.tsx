import { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Send, Mic, MicOff, Hotel, Car, MapPin } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  type?: 'text' | 'suggestion' | 'action';
  actions?: Array<{
    icon: any;
    label: string;
    action: string;
  }>;
}

const INITIAL_SUGGESTIONS = [
  { icon: Hotel, label: 'Book Hotel', action: 'BOOK_HOTEL' },
  { icon: Car, label: 'Find Transport', action: 'FIND_TRANSPORT' },
  { icon: MapPin, label: 'Explore Places', action: 'EXPLORE_PLACES' },
];

export default function AssistantScreen() {
  const { t, i18n } = useTranslation();
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('assistant.greeting'),
      isUser: false,
      type: 'text',
    },
    {
      id: '2',
      text: 'What would you like to do?',
      isUser: false,
      type: 'suggestion',
      actions: INITIAL_SUGGESTIONS,
    },
  ]);
  const [isListening, setIsListening] = useState(false);

  const handleAction = useCallback((actionType: string) => {
    let response: Message;
    switch (actionType) {
      case 'BOOK_HOTEL':
        response = {
          id: Date.now().toString(),
          text: "I'll help you find and book a hotel. What's your destination and when would you like to stay?",
          isUser: false,
          type: 'text',
        };
        break;
      case 'FIND_TRANSPORT':
        response = {
          id: Date.now().toString(),
          text: 'I can help you find the best transportation options. Where are you heading to?',
          isUser: false,
          type: 'text',
        };
        break;
      case 'EXPLORE_PLACES':
        response = {
          id: Date.now().toString(),
          text: 'I can suggest interesting places to visit. Which city are you interested in?',
          isUser: false,
          type: 'text',
        };
        break;
      default:
        return;
    }
    
    setMessages(prev => [...prev, response]);
    if (Platform.OS !== 'web') {
      Speech.speak(response.text, {
        language: i18n.language,
        rate: 0.9,
      });
    }
  }, [i18n.language]);

  const processMessage = useCallback((text: string) => {
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      let response: Message;
      
      if (text.toLowerCase().includes('hotel')) {
        response = {
          id: Date.now().toString(),
          text: "I've found several hotels that might interest you. Would you like me to show you the options?",
          isUser: false,
          type: 'action',
          actions: [
            { icon: Hotel, label: 'Show Hotels', action: 'SHOW_HOTELS' },
            { icon: MapPin, label: 'Change Location', action: 'CHANGE_LOCATION' },
          ],
        };
      } else if (text.toLowerCase().includes('transport') || text.toLowerCase().includes('taxi')) {
        response = {
          id: Date.now().toString(),
          text: 'I can help you book a taxi or find public transportation. What would you prefer?',
          isUser: false,
          type: 'action',
          actions: [
            { icon: Car, label: 'Book Taxi', action: 'BOOK_TAXI' },
            { icon: MapPin, label: 'Public Transport', action: 'PUBLIC_TRANSPORT' },
          ],
        };
      } else {
        response = {
          id: Date.now().toString(),
          text: "I understand you're interested in travel assistance. Here are some things I can help you with:",
          isUser: false,
          type: 'suggestion',
          actions: INITIAL_SUGGESTIONS,
        };
      }

      setMessages(prev => [...prev, response]);
      setIsProcessing(false);

      if (Platform.OS !== 'web') {
        Speech.speak(response.text, {
          language: i18n.language,
          rate: 0.9,
        });
      }
    }, 1500);
  }, [i18n.language]);

  const sendMessage = useCallback((text: string) => {
    if (text.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: text,
        isUser: true,
        type: 'text',
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      processMessage(text);
    }
  }, [processMessage]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Simulate speech recognition
      setTimeout(() => {
        setIsListening(false);
        sendMessage("I need a hotel in New York");
      }, 3000);
    }
  }, [isListening, sendMessage]);

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBox,
              msg.isUser ? styles.userMessage : styles.assistantMessage,
              msg.type === 'suggestion' && styles.suggestionBox,
            ]}>
            <Text style={[
              styles.messageText,
              !msg.isUser && styles.assistantMessageText
            ]}>{msg.text}</Text>

            {(msg.type === 'suggestion' || msg.type === 'action') && msg.actions && (
              <View style={styles.actionsContainer}>
                {msg.actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.actionButton}
                    onPress={() => handleAction(action.action)}
                  >
                    <action.icon size={20} color="#3B82F6" />
                    <Text style={styles.actionText}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator color="#3B82F6" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={[styles.micButton, isListening && styles.micButtonActive]}
          onPress={toggleListening}
        >
          {isListening ? (
            <MicOff size={24} color="#EF4444" />
          ) : (
            <Mic size={24} color="#3B82F6" />
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={t('assistant.placeholder')}
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={() => sendMessage(message)}
          disabled={isProcessing}
        >
          <Send size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  messageBox: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: '#3B82F6',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionBox: {
    maxWidth: '100%',
  },
  messageText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#111827',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  actionText: {
    marginLeft: 8,
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginHorizontal: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    fontSize: 16,
  },
  micButton: {
    padding: 8,
    borderRadius: 20,
  },
  micButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 24,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  processingText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
});