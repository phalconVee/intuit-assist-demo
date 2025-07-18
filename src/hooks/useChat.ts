import { useState, useEffect } from 'react';
import { MockTaxApiService, ChatSession, ChatMessage } from '../services/mockApi';

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const chatSessions = await MockTaxApiService.getChatSessions();
      setSessions(chatSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chat sessions');
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      setLoading(true);
      const session = await MockTaxApiService.getChatSession(sessionId);
      setCurrentSession(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat session');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, sessionId?: string): Promise<ChatMessage[]> => {
    try {
      setSending(true);
      setError(null);

      let targetSessionId = sessionId;
      
      // Create new session if none provided
      if (!targetSessionId) {
        const newSession = await MockTaxApiService.createChatSession(message);
        setSessions(prev => [newSession, ...prev]);
        setCurrentSession(newSession);
        return newSession.messages;
      }

      // Send message to existing session
      const newMessages = await MockTaxApiService.sendMessage(targetSessionId, message);
      
      // Update current session if it's the active one
      if (currentSession?.id === targetSessionId) {
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, ...newMessages],
          updatedAt: new Date().toISOString()
        } : null);
      }

      // Update sessions list
      setSessions(prev => prev.map(session => 
        session.id === targetSessionId 
          ? { ...session, messages: [...session.messages, ...newMessages], updatedAt: new Date().toISOString() }
          : session
      ));

      return newMessages;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setSending(false);
    }
  };

  const createNewSession = async (initialMessage: string): Promise<ChatSession> => {
    try {
      setSending(true);
      const newSession = await MockTaxApiService.createChatSession(initialMessage);
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat session');
      throw err;
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    sessions,
    currentSession,
    loading,
    sending,
    error,
    sendMessage,
    loadSession,
    createNewSession,
    setCurrentSession,
    refetchSessions: fetchSessions
  };
};