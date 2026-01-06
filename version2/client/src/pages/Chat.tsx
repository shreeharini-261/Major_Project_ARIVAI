import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { calculateCycleInfo } from "@/lib/cycleUtils";
import type { ChatMessage, Cycle } from "@shared/schema";
import { Send, Bot, Sparkles, Loader2 } from "lucide-react";

const quickReplies = [
  "I'm having cramps, what can help?",
  "What foods should I eat during my period?",
  "How can I improve my mood today?",
  "Tell me about my current cycle phase",
  "What exercises are best for me now?",
];

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: chatHistory, isLoading: historyLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat"],
  });

  const { data: cycles } = useQuery<Cycle[]>({
    queryKey: ["/api/cycles"],
  });

  const latestCycle = cycles?.[0];
  const cycleLength = user?.averageCycleLength || 28;
  const cycleInfo = latestCycle?.startDate
    ? calculateCycleInfo(latestCycle.startDate, cycleLength)
    : null;

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        content,
        cyclePhase: cycleInfo?.phase,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
      setMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (reply: string) => {
    sendMessageMutation.mutate(reply);
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const messages = chatHistory || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 pt-16 flex flex-col overflow-hidden">
        <div className="container mx-auto max-w-4xl flex-1 flex flex-col p-4 overflow-hidden">
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">
                  ARIVAI Assistant
                </h1>
                <p className="text-sm text-muted-foreground">
                  {cycleInfo
                    ? `Your wellness companion • ${cycleInfo.phase.charAt(0).toUpperCase() + cycleInfo.phase.slice(1)} Phase`
                    : "Your personal wellness companion"}
                </p>
              </div>
            </div>
          </div>

          <Card className="flex-1 bg-card border-card-border overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {historyLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                      <Skeleton className="h-16 w-3/4 rounded-2xl" />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl text-foreground mb-2">
                    Welcome to ARIVAI
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    I'm your AI wellness companion. Ask me anything about your cycle,
                    symptoms, nutrition, or emotional well-being.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    {quickReplies.map((reply, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply)}
                        disabled={sendMessageMutation.isPending}
                        className="text-sm"
                        data-testid={`quick-reply-${index}`}
                      >
                        {reply}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[80%] ${
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-primary-foreground" />
                          </div>
                        ) : (
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {sendMessageMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="flex items-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="bg-secondary rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <CardContent className="p-4 border-t border-border">
              {messages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {quickReplies.slice(0, 3).map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(reply)}
                      disabled={sendMessageMutation.isPending}
                      className="text-xs"
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  placeholder="Ask me anything about your wellness..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="resize-none bg-background border-border min-h-[44px] max-h-32"
                  rows={1}
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  size="icon"
                  className="shrink-0"
                  data-testid="button-send-message"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
