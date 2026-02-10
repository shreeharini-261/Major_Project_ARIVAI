import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { MeditationVideo } from "@shared/schema";
import { Search, Play, Clock, ExternalLink, Flower2 } from "lucide-react";

const defaultVideos: MeditationVideo[] = [
  {
    id: "1",
    title: "10-Minute Morning Meditation for Energy",
    description: "Start your day with this gentle meditation to boost energy and set positive intentions.",
    youtubeId: "inpok4MKVLM",
    thumbnailUrl: "https://img.youtube.com/vi/inpok4MKVLM/maxresdefault.jpg",
    channelName: "Goodful",
    duration: "10:00",
    category: "relaxation",
    phase: "follicular",
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Deep Sleep Meditation - Relaxing Music",
    description: "Fall into a peaceful sleep with this calming meditation and soothing background music.",
    youtubeId: "1ZYbU82GVz4",
    thumbnailUrl: "https://img.youtube.com/vi/1ZYbU82GVz4/maxresdefault.jpg",
    channelName: "Jason Stephenson",
    duration: "60:00",
    category: "sleep",
    phase: "menstrual",
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Stress Relief Breathing Exercise",
    description: "Quick breathing exercise to reduce stress and anxiety. Perfect for busy days.",
    youtubeId: "DbDoBzGY3vo",
    thumbnailUrl: "https://img.youtube.com/vi/DbDoBzGY3vo/maxresdefault.jpg",
    channelName: "Headspace",
    duration: "5:00",
    category: "breathing",
    phase: "all",
    createdAt: new Date(),
  },
  {
    id: "4",
    title: "Gentle Yoga for Menstrual Relief",
    description: "Soothing yoga poses specifically designed to ease menstrual cramps and discomfort.",
    youtubeId: "oX6I6vs1EFs",
    thumbnailUrl: "https://img.youtube.com/vi/oX6I6vs1EFs/maxresdefault.jpg",
    channelName: "Yoga With Adriene",
    duration: "20:00",
    category: "yoga",
    phase: "menstrual",
    createdAt: new Date(),
  },
  {
    id: "5",
    title: "Anxiety Relief Meditation",
    description: "Calm your mind and release anxiety with this guided meditation session.",
    youtubeId: "O-6f5wQXSu8",
    thumbnailUrl: "https://img.youtube.com/vi/O-6f5wQXSu8/maxresdefault.jpg",
    channelName: "The Honest Guys",
    duration: "15:00",
    category: "stress-relief",
    phase: "luteal",
    createdAt: new Date(),
  },
  {
    id: "6",
    title: "Body Scan Meditation for Relaxation",
    description: "Progressive body scan to release tension and promote deep relaxation.",
    youtubeId: "QS2yDmWk0vs",
    thumbnailUrl: "https://img.youtube.com/vi/QS2yDmWk0vs/maxresdefault.jpg",
    channelName: "Calm",
    duration: "12:00",
    category: "relaxation",
    phase: "all",
    createdAt: new Date(),
  },
  {
    id: "7",
    title: "Gratitude Meditation Practice",
    description: "Cultivate gratitude and positive thinking with this uplifting meditation.",
    youtubeId: "Wemm-i6XHj8",
    thumbnailUrl: "https://img.youtube.com/vi/Wemm-i6XHj8/maxresdefault.jpg",
    channelName: "Great Meditation",
    duration: "10:00",
    category: "relaxation",
    phase: "ovulation",
    createdAt: new Date(),
  },
  {
    id: "8",
    title: "4-7-8 Breathing Technique for Sleep",
    description: "Learn the famous 4-7-8 breathing technique to fall asleep faster.",
    youtubeId: "YRPh_GaiL8s",
    thumbnailUrl: "https://img.youtube.com/vi/YRPh_GaiL8s/maxresdefault.jpg",
    channelName: "Andrew Weil",
    duration: "8:00",
    category: "breathing",
    phase: "all",
    createdAt: new Date(),
  },
  {
    id: "9",
    title: "Self-Love Meditation",
    description: "Embrace self-compassion and build a loving relationship with yourself.",
    youtubeId: "szj7efHSzSE",
    thumbnailUrl: "https://img.youtube.com/vi/szj7efHSzSE/maxresdefault.jpg",
    channelName: "The Mindful Movement",
    duration: "18:00",
    category: "relaxation",
    phase: "all",
    createdAt: new Date(),
  },
];

const categoryLabels: Record<string, string> = {
  relaxation: "Relaxation",
  sleep: "Sleep",
  "stress-relief": "Stress Relief",
  breathing: "Breathing",
  yoga: "Yoga",
};

const phaseLabels: Record<string, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
  all: "All Phases",
};

export default function Meditation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVideo, setSelectedVideo] = useState<MeditationVideo | null>(null);

  const { data: videos, isLoading } = useQuery<MeditationVideo[]>({
    queryKey: ["/api/meditation-videos"],
    placeholderData: defaultVideos,
  });

  const displayVideos = videos || defaultVideos;

  const filteredVideos = displayVideos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.channelName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || video.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredVideo = filteredVideos[0];
  const otherVideos = filteredVideos.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Meditation & Mindfulness
            </h1>
            <p className="text-muted-foreground mt-1">
              Curated videos for relaxation, stress relief, and inner peace
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-card-border"
                data-testid="input-search-videos"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px] bg-card border-card-border" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="relaxation">Relaxation</SelectItem>
                <SelectItem value="sleep">Sleep</SelectItem>
                <SelectItem value="stress-relief">Stress Relief</SelectItem>
                <SelectItem value="breathing">Breathing</SelectItem>
                <SelectItem value="yoga">Yoga</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-80 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            </div>
          ) : filteredVideos.length === 0 ? (
            <Card className="bg-card border-card-border">
              <CardContent className="p-8 text-center">
                <Flower2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl text-foreground mb-2">No videos found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {featuredVideo && (
                <Card
                  className="bg-card border-card-border overflow-hidden hover-elevate cursor-pointer"
                  onClick={() => setSelectedVideo(featuredVideo)}
                  data-testid="card-featured-video"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={featuredVideo.thumbnailUrl || `https://img.youtube.com/vi/${featuredVideo.youtubeId}/maxresdefault.jpg`}
                        alt={featuredVideo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play className="w-8 h-8 text-primary-foreground ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="bg-black/70 text-white">
                          {featuredVideo.duration}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6 flex flex-col justify-center">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge>{categoryLabels[featuredVideo.category || "relaxation"]}</Badge>
                        <Badge variant="outline">{phaseLabels[featuredVideo.phase || "all"]}</Badge>
                      </div>
                      <h2 className="font-serif text-2xl text-foreground mb-2">
                        {featuredVideo.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {featuredVideo.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {featuredVideo.channelName}
                      </p>
                    </CardContent>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherVideos.map((video) => (
                  <Card
                    key={video.id}
                    className="bg-card border-card-border overflow-hidden hover-elevate cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                    data-testid={`card-video-${video.id}`}
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="bg-black/70 text-white">
                          {video.duration}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {video.channelName}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[video.category || "relaxation"]}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="bg-card border-card-border max-w-3xl">
          {selectedVideo && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">{selectedVideo.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <Badge>{categoryLabels[selectedVideo.category || "relaxation"]}</Badge>
                  <Badge variant="outline">{phaseLabels[selectedVideo.phase || "all"]}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{selectedVideo.duration}</span>
                  </div>
                </div>

                <p className="text-muted-foreground">{selectedVideo.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">{selectedVideo.channelName}</span>
                  <a
                    href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" data-testid="button-youtube-link">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Watch on YouTube
                    </Button>
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
