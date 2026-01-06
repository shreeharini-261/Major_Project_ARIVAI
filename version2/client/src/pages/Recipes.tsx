import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Recipe, MenstrualPhase } from "@shared/schema";
import { Search, Clock, Flame, UtensilsCrossed, X } from "lucide-react";

const defaultRecipes: Recipe[] = [
  {
    id: "1",
    title: "Dark Chocolate Avocado Mousse",
    description: "Rich, creamy chocolate mousse made with avocado for healthy fats. Perfect for satisfying chocolate cravings during your luteal phase.",
    imageUrl: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=300&fit=crop",
    ingredients: ["2 ripe avocados", "1/4 cup cocoa powder", "1/4 cup honey or maple syrup", "1/4 cup almond milk", "1 tsp vanilla extract", "Pinch of sea salt"],
    instructions: "1. Blend all ingredients until smooth\n2. Chill for 30 minutes\n3. Serve with fresh berries",
    prepTime: 10,
    calories: 180,
    phase: "luteal",
    tags: ["vegan", "gluten-free", "high-magnesium"],
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Iron-Rich Spinach Smoothie",
    description: "A nutrient-packed green smoothie to replenish iron during your menstrual phase. Sweet and refreshing!",
    imageUrl: "https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400&h=300&fit=crop",
    ingredients: ["2 cups spinach", "1 banana", "1 cup orange juice", "1/2 cup frozen mango", "1 tbsp chia seeds", "1 tbsp almond butter"],
    instructions: "1. Add all ingredients to blender\n2. Blend until smooth\n3. Add ice if desired",
    prepTime: 5,
    calories: 220,
    phase: "menstrual",
    tags: ["vegan", "high-iron", "energy-boost"],
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Quinoa Energy Bowl",
    description: "Protein-rich quinoa bowl with roasted vegetables. Great for the follicular phase when energy is rising.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    ingredients: ["1 cup cooked quinoa", "1 cup roasted sweet potato", "1/2 cup chickpeas", "1 cup kale", "2 tbsp tahini", "Lemon juice"],
    instructions: "1. Cook quinoa according to package\n2. Roast sweet potato cubes\n3. Massage kale with olive oil\n4. Assemble bowl and drizzle with tahini lemon dressing",
    prepTime: 25,
    calories: 380,
    phase: "follicular",
    tags: ["vegan", "high-protein", "meal-prep"],
    createdAt: new Date(),
  },
  {
    id: "4",
    title: "Salmon Omega Bowl",
    description: "Anti-inflammatory salmon with omega-3 fatty acids. Perfect for reducing bloating during ovulation.",
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    ingredients: ["4 oz salmon fillet", "1 cup brown rice", "1 cup edamame", "1/2 avocado", "Pickled ginger", "Soy sauce"],
    instructions: "1. Grill or bake salmon\n2. Cook brown rice\n3. Arrange bowl with all ingredients\n4. Drizzle with soy sauce",
    prepTime: 20,
    calories: 450,
    phase: "ovulation",
    tags: ["high-protein", "omega-3", "anti-inflammatory"],
    createdAt: new Date(),
  },
  {
    id: "5",
    title: "Turmeric Golden Milk",
    description: "Warming anti-inflammatory drink with turmeric and ginger. Soothes cramps and promotes relaxation.",
    imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop",
    ingredients: ["1 cup coconut milk", "1 tsp turmeric", "1/2 tsp cinnamon", "1/4 tsp ginger", "1 tsp honey", "Black pepper"],
    instructions: "1. Heat coconut milk in a saucepan\n2. Whisk in turmeric, cinnamon, and ginger\n3. Add honey and a pinch of black pepper\n4. Simmer for 5 minutes",
    prepTime: 8,
    calories: 120,
    phase: "menstrual",
    tags: ["vegan", "anti-inflammatory", "comfort"],
    createdAt: new Date(),
  },
  {
    id: "6",
    title: "Berry Protein Bites",
    description: "No-bake energy bites packed with berries and protein. Great for combating PMS fatigue.",
    imageUrl: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=300&fit=crop",
    ingredients: ["1 cup oats", "1/2 cup almond butter", "1/3 cup honey", "1/2 cup dried cranberries", "2 tbsp protein powder", "1/4 cup dark chocolate chips"],
    instructions: "1. Mix all ingredients in a bowl\n2. Roll into small balls\n3. Refrigerate for 30 minutes\n4. Store in airtight container",
    prepTime: 15,
    calories: 90,
    phase: "luteal",
    tags: ["high-protein", "energy-boost", "snack"],
    createdAt: new Date(),
  },
  {
    id: "7",
    title: "Mediterranean Hummus Plate",
    description: "Balanced plate with homemade hummus, fresh veggies, and whole grain pita. Perfect everyday snack.",
    imageUrl: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=300&fit=crop",
    ingredients: ["1 cup hummus", "Cucumber slices", "Cherry tomatoes", "Carrot sticks", "Whole grain pita", "Olive oil", "Za'atar"],
    instructions: "1. Arrange hummus in center of plate\n2. Surround with fresh vegetables\n3. Drizzle olive oil and sprinkle za'atar\n4. Serve with warm pita",
    prepTime: 10,
    calories: 280,
    phase: "all",
    tags: ["vegetarian", "fiber-rich", "mediterranean"],
    createdAt: new Date(),
  },
  {
    id: "8",
    title: "Magnesium-Rich Trail Mix",
    description: "Custom trail mix with magnesium-rich nuts and seeds. Helps reduce cramps and mood swings.",
    imageUrl: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&h=300&fit=crop",
    ingredients: ["1/2 cup almonds", "1/2 cup pumpkin seeds", "1/4 cup dark chocolate chips", "1/4 cup dried apricots", "1/4 cup cashews", "1 tbsp coconut flakes"],
    instructions: "1. Mix all ingredients in a bowl\n2. Store in airtight container\n3. Portion into snack bags for convenience",
    prepTime: 5,
    calories: 200,
    phase: "luteal",
    tags: ["vegan", "high-magnesium", "portable"],
    createdAt: new Date(),
  },
];

const phaseLabels: Record<string, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
  all: "All Phases",
};

export default function Recipes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
    placeholderData: defaultRecipes,
  });

  const displayRecipes = recipes || defaultRecipes;

  const filteredRecipes = displayRecipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPhase =
      selectedPhase === "all" || recipe.phase === selectedPhase || recipe.phase === "all";

    return matchesSearch && matchesPhase;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Healthy Recipes
            </h1>
            <p className="text-muted-foreground mt-1">
              Phase-specific nutrition to support your cycle
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-card-border"
                data-testid="input-search-recipes"
              />
            </div>
            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger className="w-full sm:w-[180px] bg-card border-card-border" data-testid="select-phase">
                <SelectValue placeholder="Filter by phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                <SelectItem value="menstrual">Menstrual</SelectItem>
                <SelectItem value="follicular">Follicular</SelectItem>
                <SelectItem value="ovulation">Ovulation</SelectItem>
                <SelectItem value="luteal">Luteal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          ) : filteredRecipes.length === 0 ? (
            <Card className="bg-card border-card-border">
              <CardContent className="p-8 text-center">
                <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl text-foreground mb-2">No recipes found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="bg-card border-card-border overflow-hidden hover-elevate cursor-pointer transition-all duration-200"
                  onClick={() => setSelectedRecipe(recipe)}
                  data-testid={`card-recipe-${recipe.id}`}
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        {phaseLabels[recipe.phase || "all"]}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1">
                      {recipe.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.prepTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        <span>{recipe.calories} cal</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {recipe.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="bg-card border-card-border max-w-2xl max-h-[90vh] overflow-hidden">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">{selectedRecipe.title}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-4">
                  <img
                    src={selectedRecipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"}
                    alt={selectedRecipe.title}
                    className="w-full aspect-video object-cover rounded-lg"
                  />

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm">{selectedRecipe.prepTime} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-primary" />
                      <span className="text-sm">{selectedRecipe.calories} calories</span>
                    </div>
                    <Badge>{phaseLabels[selectedRecipe.phase || "all"]}</Badge>
                  </div>

                  <p className="text-muted-foreground">{selectedRecipe.description}</p>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Ingredients</h4>
                    <ul className="space-y-1">
                      {selectedRecipe.ingredients?.map((ingredient, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Instructions</h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {selectedRecipe.instructions}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.tags?.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
