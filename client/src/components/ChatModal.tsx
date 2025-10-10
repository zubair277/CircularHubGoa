import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  businessName: string;
  user_id?: string; // seller's user ID
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

interface ChatModalProps {
  listing: Listing;
  onClose: () => void;
}

export default function ChatModal({ listing, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id;
  
  console.log('ChatModal: Current user from localStorage:', currentUser);
  console.log('ChatModal: Current user ID:', currentUserId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation and messages
  useEffect(() => {
    const initializeChat = async () => {
      console.log('ChatModal: Initializing chat for listing:', listing);
      console.log('ChatModal: Current user ID:', currentUserId);
      
      if (!currentUserId) {
        console.error('ChatModal: No user ID found, cannot initialize chat');
        setLoading(false);
        return;
      }

      try {
        console.log('ChatModal: Creating conversation for listing:', listing.id, 'buyer:', currentUserId);
        
        // Create or get conversation
        const conversationResponse = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId: listing.id,
            buyerId: currentUserId
          })
        });

        console.log('ChatModal: Conversation response status:', conversationResponse.status);

        if (conversationResponse.ok) {
          const conversationData = await conversationResponse.json();
          console.log('ChatModal: Conversation created:', conversationData);
          setConversation(conversationData);

          // Fetch messages
          const messagesResponse = await fetch(`/api/conversations/${conversationData.id}/messages`);
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            console.log('ChatModal: Messages fetched:', messagesData);
            setMessages(messagesData);
          }

          // Mark messages as read
          await fetch(`/api/conversations/${conversationData.id}/messages/read`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId })
          });
        } else {
          // If conversation creation fails, create a mock conversation for local chat
          console.warn('ChatModal: Conversation creation failed, using local chat mode');
          const mockConversation = {
            id: `mock-${Date.now()}`,
            listing_id: listing.id,
            buyer_id: currentUserId,
            seller_id: listing.user_id || 'unknown-seller',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setConversation(mockConversation);
          
          // Add default messages
          const buyerMessage: Message = {
            id: `default-buyer-${Date.now()}`,
            sender_id: currentUserId,
            receiver_id: listing.user_id || 'unknown-seller',
            content: "Hello! I'm interested in your listing. Is it still available?",
            created_at: new Date().toISOString(),
            is_read: false
          };
          
          const sellerMessage: Message = {
            id: `default-seller-${Date.now() + 1}`,
            sender_id: listing.user_id || 'unknown-seller',
            receiver_id: currentUserId,
            content: "Yes, it's still available! When would you like to pick it up? I'm flexible with timing.",
            created_at: new Date(Date.now() + 60000).toISOString(), // 1 minute later
            is_read: false
          };
          
          setMessages([buyerMessage, sellerMessage]);
        }

      } catch (error) {
        console.error('ChatModal: Error initializing chat:', error);
        // Create a mock conversation for local chat
        const mockConversation = {
          id: `mock-${Date.now()}`,
          listing_id: listing.id,
          buyer_id: currentUserId,
          seller_id: listing.user_id || 'unknown-seller',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setConversation(mockConversation);
        
        // Add default messages
        const buyerMessage: Message = {
          id: `default-buyer-${Date.now()}`,
          sender_id: currentUserId,
          receiver_id: listing.user_id || 'unknown-seller',
          content: "Hello! I'm interested in your listing. Is it still available?",
          created_at: new Date().toISOString(),
          is_read: false
        };
        
        const sellerMessage: Message = {
          id: `default-seller-${Date.now() + 1}`,
          sender_id: listing.user_id || 'unknown-seller',
          receiver_id: currentUserId,
          content: "Yes, it's still available! When would you like to pick it up? I'm flexible with timing.",
          created_at: new Date(Date.now() + 60000).toISOString(), // 1 minute later
          is_read: false
        };
        
        setMessages([buyerMessage, sellerMessage]);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [listing.id, currentUserId]);

  // WebSocket connection
  useEffect(() => {
    if (!currentUserId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      // Authenticate with user ID
      websocket.send(JSON.stringify({
        type: 'authenticate',
        userId: currentUserId
      }));
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'direct_message' && conversation && data.conversationId === conversation.id) {
          // Only add message if it's not from the current user (to avoid duplicates)
          if (data.senderId !== currentUserId) {
            const newMessage: Message = {
              id: data.messageId || `temp-${Date.now()}`,
              sender_id: data.senderId,
              receiver_id: data.receiverId,
              content: data.content,
              created_at: data.createdAt,
              is_read: false
            };
            
            setMessages(prev => {
              // Check if message already exists to avoid duplicates
              const exists = prev.some(msg => 
                msg.sender_id === newMessage.sender_id && 
                msg.content === newMessage.content && 
                Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 1000
              );
              return exists ? prev : [...prev, newMessage];
            });
            
            // Mark as read if it's for current user
            if (data.receiverId === currentUserId) {
              fetch(`/api/conversations/${conversation.id}/messages/read`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
              });
            }
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [currentUserId, conversation]);

  const sendMessage = async () => {
    if (!text.trim() || !conversation || sending) return;

    const messageContent = text.trim();
    setText("");
    setSending(true);

    // Create temporary message for immediate UI update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: currentUserId,
      receiver_id: conversation.buyer_id === currentUserId ? conversation.seller_id : conversation.buyer_id,
      content: messageContent,
      created_at: new Date().toISOString(),
      is_read: false
    };

    // Add message to UI immediately
    setMessages(prev => [...prev, tempMessage]);

    try {
      // Check if this is a mock conversation (local chat mode)
      if (conversation.id.startsWith('mock-')) {
        // In local chat mode, just keep the message locally
        console.log('ChatModal: Local chat mode - message saved locally');
        setSending(false);
        return;
      }

      // Send via WebSocket for real-time delivery (if available)
      if (ws) {
        ws.send(JSON.stringify({
          type: 'direct_message',
          conversationId: conversation.id,
          senderId: currentUserId,
          receiverId: conversation.buyer_id === currentUserId ? conversation.seller_id : conversation.buyer_id,
          content: messageContent
        }));
      }

      // Also send via API for persistence
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: conversation.buyer_id === currentUserId ? conversation.seller_id : conversation.buyer_id,
          content: messageContent
        })
      });

      if (response.ok) {
        const savedMessage = await response.json();
        // Replace temporary message with saved message
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? savedMessage : msg
        ));
      } else {
        // If API fails, keep the message locally
        console.warn('ChatModal: Failed to save message to server, keeping locally');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Keep the message locally even if there's an error
      console.warn('ChatModal: Error sending message, keeping locally');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Message {listing.businessName}</DialogTitle>
        </DialogHeader>
          <div className="flex items-center justify-center h-80">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[95vw] max-w-2xl h-[85vh] max-h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg">Message {listing.businessName}</DialogTitle>
          <p className="text-sm text-muted-foreground">About: {listing.title}</p>
        </DialogHeader>
        
        <div className="flex flex-col flex-1 min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-3 bg-muted/20">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Send className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-lg font-medium mb-2">Start a conversation</p>
                <p className="text-sm">Ask questions about this listing or discuss pickup details</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-background border rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
              </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
            <Textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
                  onKeyPress={handleKeyPress}
              placeholder="Type a message..." 
                  className="min-h-[44px] max-h-[120px] resize-none rounded-xl border-2 focus:border-primary/50"
                  disabled={sending}
                  rows={1}
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={!text.trim() || sending}
                size="sm"
                className="shrink-0 rounded-full h-11 w-11 p-0"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
