import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import Button from '../Button';
import LoadingSpinner from '../LoadingSpinner';
import AlertMessage from '../common/AlertMessage';

// ── Helpers ──

/** Split text into overlapping chunks for retrieval. */
const chunkText = (text: string, chunkSize = 500, overlap = 100): string[] => {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    let chunk = text.substring(i, end);

    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastSpace = chunk.lastIndexOf(' ');
      if (lastPeriod > -1 && lastPeriod > chunkSize * 0.8) {
        chunk = text.substring(i, i + lastPeriod + 1);
      } else if (lastSpace > -1 && lastSpace > chunkSize * 0.8) {
        chunk = text.substring(i, i + lastSpace);
      }
    }

    chunks.push(chunk.trim());
    i += (chunk.length || chunkSize) - overlap;
    if (i >= text.length - overlap && i < text.length) {
      if (!chunks.some((c) => c.includes(text.substring(i)))) {
        chunks.push(text.substring(i).trim());
      }
      break;
    }
  }
  return chunks.filter((c) => c.length > 0);
};

/** Keyword-based retrieval: score each chunk by word overlap with the query. */
const retrieveRelevantChunks = (query: string, chunks: string[], maxChunks = 5): string[] => {
  if (!query || chunks.length === 0) return [];
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  if (queryWords.length === 0) return [];

  const scored = chunks
    .map((chunk) => {
      const lower = chunk.toLowerCase();
      let score = 0;
      for (const w of queryWords) if (lower.includes(w)) score++;
      return { chunk, score };
    })
    .filter((item) => item.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxChunks).map((item) => item.chunk);
};

// ── Component ──

const DocumentQASystem: React.FC = () => {
  const [knowledgeBaseText, setKnowledgeBaseText] = useState('');
  const [documentChunks, setDocumentChunks] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [chatInstance, setChatInstance] = useState<ChatSession | null>(null);

  const [loading, setLoading] = useState(false);
  const [processingDocuments, setProcessingDocuments] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleProcessDocuments = useCallback(() => {
    setProcessingDocuments(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setDocumentChunks([]);
    setChatHistory([]);
    setChatInstance(null);

    if (!knowledgeBaseText.trim()) {
      setErrorMessage('Please enter some text for the knowledge base.');
      setProcessingDocuments(false);
      return;
    }

    try {
      const chunks = chunkText(knowledgeBaseText);
      setDocumentChunks(chunks);
      setSuccessMessage(
        `Successfully processed ${chunks.length} document chunks. You can now start a conversation.`
      );

      // Initialize Gemini Chat via v0.14.x API
      const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || '';
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500,
        },
        systemInstruction:
          'You are a helpful assistant for The Stoneridge School. Only answer questions based on the provided context in each turn. If the answer is not explicitly stated in the context, clearly state "I cannot answer this question based on the provided documents." Do not use outside knowledge.',
      });

      const chat = model.startChat({ history: [] });
      setChatInstance(chat);
    } catch (error) {
      setErrorMessage('Failed to process documents or initialize chat: ' + (error as Error).message);
    } finally {
      setProcessingDocuments(false);
    }
  }, [knowledgeBaseText]);

  const handleClearDocuments = useCallback(() => {
    setKnowledgeBaseText('');
    setDocumentChunks([]);
    setCurrentMessage('');
    setChatHistory([]);
    setChatInstance(null);
    setSuccessMessage('Knowledge base and chat cleared.');
    setErrorMessage(null);
  }, []);

  const handleStartNewChat = useCallback(() => {
    setChatHistory([]);
    setCurrentMessage('');
    setSuccessMessage('New chat started. Your knowledge base remains active.');
    setErrorMessage(null);
  }, []);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const userMessage = currentMessage.trim();
      if (!userMessage) {
        setErrorMessage('Please enter a message.');
        setLoading(false);
        return;
      }
      if (!chatInstance || documentChunks.length === 0) {
        setErrorMessage('Please process your knowledge base documents first.');
        setLoading(false);
        return;
      }

      setChatHistory((prev) => [...prev, { role: 'user', text: userMessage }]);
      setCurrentMessage('');

      try {
        const relevantChunks = retrieveRelevantChunks(userMessage, documentChunks);
        const contextString =
          relevantChunks.length > 0
            ? `Here are some relevant document snippets:\n${relevantChunks.map((c) => `- ${c}`).join('\n')}`
            : '(No highly relevant documents found for this specific query within the knowledge base.)';

        const messageWithGrounding = `${contextString}\n\nUser Question: ${userMessage}`;

        let accumulatedText = '';
        setChatHistory((prev) => [...prev, { role: 'model', text: '' }]);

        const streamResult = await chatInstance.sendMessageStream(messageWithGrounding);

        for await (const chunk of streamResult.stream) {
          const textChunk = chunk.text();
          if (textChunk) {
            accumulatedText += textChunk;
            setChatHistory((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'model') {
                return [...prev.slice(0, -1), { ...last, text: accumulatedText }];
              }
              return [...prev, { role: 'model', text: accumulatedText }];
            });
          }
        }

        setSuccessMessage('Message sent successfully!');
      } catch (error) {
        console.error('Gemini API Error:', error);
        setErrorMessage(
          'Failed to get response from AI. Please check your API key and try again.'
        );
        setChatHistory((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'model' && last.text === '') {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        setLoading(false);
      }
    },
    [currentMessage, chatInstance, documentChunks]
  );

  const isApiKeyAvailable = useMemo(() => {
    return typeof process !== 'undefined' && process.env && process.env.API_KEY;
  }, []);

  const isChatReady = !processingDocuments && documentChunks.length > 0 && chatInstance !== null;

  if (!isApiKeyAvailable) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p className="font-bold">API Key Missing</p>
        <p className="mt-2">
          Google GenAI API Key is not configured. Please set <code>GEMINI_API_KEY</code> in your{' '}
          <code>.env</code> file.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Document-Grounded Q&A (RAG Chat)</h2>
      <p className="mb-4 text-gray-600">
        Paste text documents below to create a knowledge base. Then, chat with the AI, and it will
        answer <em>only</em> using the provided information.
      </p>

      {successMessage && <AlertMessage type="success" message={successMessage} className="mb-4" />}
      {errorMessage && <AlertMessage type="error" message={errorMessage} className="mb-4" />}

      <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
        <label htmlFor="knowledge-base-text" className="block text-gray-700 text-sm font-bold mb-2">
          Knowledge Base Documents
        </label>
        <textarea
          id="knowledge-base-text"
          rows={10}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
          placeholder="Paste your documents here. The system will automatically chunk them for retrieval."
          value={knowledgeBaseText}
          onChange={(e) => setKnowledgeBaseText(e.target.value)}
          aria-label="Knowledge base text input"
          disabled={processingDocuments}
        />
        <div className="flex justify-end space-x-2">
          <Button onClick={handleClearDocuments} variant="outline" disabled={processingDocuments}>
            Clear Knowledge Base
          </Button>
          <Button
            onClick={handleProcessDocuments}
            disabled={processingDocuments || !knowledgeBaseText.trim()}
          >
            {processingDocuments ? <LoadingSpinner /> : 'Process Documents'}
          </Button>
        </div>
        {documentChunks.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">{documentChunks.length} chunks processed.</p>
        )}
      </div>

      {isChatReady && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Chat with your Documents</h3>
          <div className="flex justify-end mb-4">
            <Button onClick={handleStartNewChat} variant="secondary">
              Start New Chat
            </Button>
          </div>
          <div
            ref={chatWindowRef}
            className="border border-gray-200 rounded-lg p-4 h-96 overflow-y-auto bg-gray-50 mb-4 flex flex-col space-y-4"
            aria-live="polite"
            aria-atomic="false"
          >
            {chatHistory.length === 0 ? (
              <p className="text-gray-500 italic text-center">No messages yet. Ask something!</p>
            ) : (
              chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg shadow-md ${msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    role="log"
                    aria-label={`${msg.role} message`}
                  >
                    <strong className="block text-xs font-semibold mb-1">
                      {msg.role === 'user' ? 'You' : 'AI'}
                    </strong>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <textarea
              className="flex-grow shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={2}
              placeholder="Type your message here..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              disabled={loading || !isChatReady}
              aria-label="Chat message input"
            />
            <Button type="submit" disabled={loading || !isChatReady || !currentMessage.trim()}>
              {loading ? <LoadingSpinner /> : 'Send'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DocumentQASystem;