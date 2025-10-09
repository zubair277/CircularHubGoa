import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, DollarSign, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

// Mock data for testing
const mockConversations = [
  {
    id: "conv-1",
    participants: ["demo-user-1", "user-2"],
    lastMessage: "Hi, I'm interested in your organic waste listing",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    otherUser: {
      id: "user-2",
      name: "Green Solutions",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=GS",
      businessType: "Waste Management"
    }
  },
  {
    id: "conv-2", 
    participants: ["demo-user-1", "user-3"],
    lastMessage: "Thanks for the offer! When can you pick up?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    otherUser: {
      id: "user-3",
      name: "Beach Paradise Resort",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BPR",
      businessType: "Hotel"
    }
  }
];

const mockMessages = {
  "conv-1": [
    {
      id: "msg-1",
      senderId: "user-2",
      content: "Hi! I saw your organic waste listing. Is it still available?",
      type: "text",
      createdAt: new Date(Date.now() - 1000 * 60 * 10)
    },
    {
      id: "msg-2", 
      senderId: "demo-user-1",
      content: "Yes, it's still available. 25kg of kitchen waste from our restaurant.",
      type: "text",
      createdAt: new Date(Date.now() - 1000 * 60 * 8)
    },
    {
      id: "msg-3",
      senderId: "user-2", 
      content: "Perfect! I can offer ₹500 for it. When can I pick it up?",
      type: "offer",
      offerAmount: 500,
      createdAt: new Date(Date.now() - 1000 * 60 * 5)
    }
  ],
  "conv-2": [
    {
      id: "msg-4",
      senderId: "demo-user-1",
      content: "Hi, I'm interested in your glass bottles listing",
      type: "text", 
      createdAt: new Date(Date.now() - 1000 * 60 * 45)
    },
    {
      id: "msg-5",
      senderId: "user-3",
      content: "Great! We have 50 clean glass bottles ready for pickup",
      type: "text",
      createdAt: new Date(Date.now() - 1000 * 60 * 40)
    },
    {
      id: "msg-6",
      senderId: "demo-user-1",
      content: "I can offer ₹300 for all of them",
      type: "offer",
      offerAmount: 300,
      createdAt: new Date(Date.now() - 1000 * 60 * 35)
    },
    {
      id: "msg-7",
      senderId: "user-3", 
      content: "Thanks for the offer! When can you pick up?",
      type: "text",
      createdAt: new Date(Date.now() - 1000 * 60 * 30)
    }
  ]
};

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock WebSocket connection
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Mock WebSocket connection
    const mockWs = {
      send: (data: string) => {
        const message = JSON.parse(data);
        console.log("Mock WebSocket send:", message);
        // Simulate receiving the message back
        setTimeout(() => {
          const newMessage = {
            id: `msg-${Date.now()}`,
            ...message,
            createdAt: new Date()
          };
          // Update the mock messages
          if (mockMessages[selectedConversation as keyof typeof mockMessages]) {
            mockMessages[selectedConversation as keyof typeof mockMessages].push(newMessage);
          }
        }, 100);
      },
      close: () => {}
    } as WebSocket;
    setWs(mockWs);
  }, [selectedConversation]);

  // Fetch conversations
  const { data: conversations = mockConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations?userId=demo-user-1");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const res = await fetch(`/api/messages/${selectedConversation}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversation) throw new Error("No conversation selected");
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation,
          senderId: "demo-user-1",
          content,
          type: "text"
        }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
      setMessageInput("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Send offer mutation
  const sendOfferMutation = useMutation({
    mutationFn: async ({ amount, notes }: { amount: number; notes: string }) => {
      if (!selectedConversation) throw new Error("No conversation selected");
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation,
          senderId: "demo-user-1",
          offerAmount: amount,
          content: notes
        }),
      });
      if (!res.ok) throw new Error("Failed to send offer");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
      setShowOfferModal(false);
      toast({ title: "Offer sent!", description: "Your offer has been sent successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessageMutation.mutate(messageInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const currentMessages = selectedConversation ? mockMessages[selectedConversation as keyof typeof mockMessages] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                        selectedConversation === conversation.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conversation.otherUser.avatar} />
                          <AvatarFallback>
                            {conversation.otherUser.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm truncate">
                              {conversation.otherUser.name}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(conversation.lastMessageTime, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.otherUser.businessType}
                          </p>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              {selectedConversation ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedConv?.otherUser.avatar} />
                        <AvatarFallback>
                          {selectedConv?.otherUser.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{selectedConv?.otherUser.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{selectedConv?.otherUser.businessType}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {currentMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === "demo-user-1" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[70%] ${message.senderId === "demo-user-1" ? "order-2" : "order-1"}`}>
                            {message.type === "offer" ? (
                              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="font-semibold text-green-800">Offer Made</span>
                                </div>
                                <div className="text-lg font-bold text-green-700">
                                  ₹{message.offerAmount}
                                </div>
                                {message.content && (
                                  <p className="text-sm text-muted-foreground mt-1">{message.content}</p>
                                )}
                              </div>
                            ) : (
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  message.senderId === "demo-user-1"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="border-t p-4 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim() || sendMessageMutation.isPending}
                          size="icon"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowOfferModal(true)}
                        className="w-full"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Make Offer
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">Choose a conversation from the sidebar to start chatting</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Make Offer Modal */}
      {showOfferModal && (
        <MakeOfferModal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          onSendOffer={sendOfferMutation.mutate}
          isLoading={sendOfferMutation.isPending}
        />
      )}
    </div>
  );
}

// Make Offer Modal Component
interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendOffer: (data: { amount: number; notes: string }) => void;
  isLoading: boolean;
}

function MakeOfferModal({ isOpen, onClose, onSendOffer, isLoading }: MakeOfferModalProps) {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    onSendOffer({ amount: Number(amount), notes });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Make an Offer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Offer Amount (₹)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              className="w-full p-3 border rounded-md resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !amount}>
              {isLoading ? "Sending..." : "Send Offer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
