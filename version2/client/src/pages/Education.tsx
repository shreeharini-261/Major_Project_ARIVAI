import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { EducationalContent } from "@shared/schema";
import { BookOpen, Clock, Heart, Baby, Thermometer, Sparkles } from "lucide-react";

const defaultContent: EducationalContent[] = [
  {
    id: "1",
    title: "Understanding Your Menstrual Cycle",
    category: "pms",
    excerpt: "Learn about the four phases of your menstrual cycle and how they affect your body and mind.",
    content: `# Understanding Your Menstrual Cycle

Your menstrual cycle is a complex and beautiful process that prepares your body for potential pregnancy each month. Understanding these phases can help you work with your body rather than against it.

## The Four Phases

### 1. Menstrual Phase (Days 1-5)
This is when your period occurs. The uterine lining sheds, and hormone levels are at their lowest. You may experience:
- Cramps and lower back pain
- Fatigue and low energy
- Mood changes

**Tips:** Rest when possible, use heat for cramps, eat iron-rich foods.

### 2. Follicular Phase (Days 6-12)
Estrogen begins to rise, preparing an egg for release. You'll likely notice:
- Increasing energy levels
- Improved mood and confidence
- Better skin clarity

**Tips:** Great time for new projects and social activities.

### 3. Ovulation Phase (Days 13-15)
The egg is released and fertility peaks. You may experience:
- Highest energy of the cycle
- Increased libido
- Light spotting (normal for some)

**Tips:** Your body is at peak performance - ideal for challenging workouts.

### 4. Luteal Phase (Days 16-28)
Progesterone rises as the body prepares for potential pregnancy. Common experiences:
- PMS symptoms in the later days
- Cravings, especially for carbs
- Mood fluctuations

**Tips:** Prioritize self-care, complex carbs, and magnesium-rich foods.

## Tracking Your Cycle
Keeping track of your cycle helps you:
- Predict your period
- Understand your patterns
- Identify any irregularities
- Plan around your energy levels`,
    readTime: 5,
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Managing PMS Symptoms Naturally",
    category: "pms",
    excerpt: "Discover natural remedies and lifestyle changes that can help reduce premenstrual syndrome symptoms.",
    content: `# Managing PMS Symptoms Naturally

Premenstrual Syndrome (PMS) affects up to 75% of menstruating women. While symptoms vary, there are many natural ways to find relief.

## Common PMS Symptoms
- Mood swings and irritability
- Bloating and water retention
- Breast tenderness
- Fatigue
- Headaches
- Cravings

## Natural Remedies

### Dietary Changes
**Increase:**
- Calcium-rich foods (dairy, leafy greens)
- Magnesium (dark chocolate, nuts, seeds)
- Omega-3 fatty acids (salmon, walnuts)
- Complex carbohydrates

**Reduce:**
- Salt (reduces bloating)
- Caffeine (can worsen anxiety)
- Alcohol
- Sugar

### Exercise
Regular exercise can significantly reduce PMS symptoms by:
- Releasing endorphins
- Reducing stress
- Improving sleep
- Decreasing bloating

Even gentle activities like walking, yoga, or swimming can help.

### Stress Management
- Practice deep breathing exercises
- Try meditation or mindfulness
- Get adequate sleep (7-9 hours)
- Maintain a regular sleep schedule

### Herbal Supplements
Some women find relief with:
- Evening primrose oil
- Chasteberry (Vitex)
- Ginger tea
- Chamomile

**Note:** Always consult with a healthcare provider before starting supplements.

## When to See a Doctor
Consult a healthcare provider if:
- Symptoms severely impact daily life
- OTC pain relievers don't help
- You experience depression or anxiety
- Symptoms suddenly change or worsen`,
    readTime: 6,
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Pregnancy: What to Expect",
    category: "pregnancy",
    excerpt: "A comprehensive guide to the three trimesters of pregnancy and what changes to expect.",
    content: `# Pregnancy: What to Expect

Pregnancy is a remarkable 40-week journey divided into three trimesters. Here's what to expect during each phase.

## First Trimester (Weeks 1-12)

### Physical Changes
- Breast tenderness and enlargement
- Fatigue and increased need for sleep
- Morning sickness (can occur any time)
- Frequent urination
- Food aversions or cravings

### Baby's Development
- Major organs begin forming
- Heart starts beating (week 6)
- Arms and legs develop
- By week 12, baby is about 2 inches long

### Important Steps
- Schedule prenatal appointments
- Start taking prenatal vitamins
- Avoid alcohol, smoking, and certain foods
- Stay hydrated

## Second Trimester (Weeks 13-26)

### Physical Changes
- "Baby bump" becomes visible
- Energy often returns
- Feeling baby's first movements (around week 20)
- Skin changes (stretch marks, linea nigra)

### Baby's Development
- Can hear sounds
- Eyes open and close
- Develops fingerprints
- By week 26, weighs about 2 pounds

### Important Steps
- Anatomy ultrasound (week 18-22)
- Consider childbirth classes
- Start planning the nursery

## Third Trimester (Weeks 27-40)

### Physical Changes
- Braxton Hicks contractions
- Back pain and pelvic pressure
- Difficulty sleeping
- Swelling in feet and ankles

### Baby's Development
- Lungs mature
- Baby gains weight rapidly
- Moves into head-down position
- Full term at 39 weeks

### Important Steps
- Prepare hospital bag
- Install car seat
- Finalize birth plan
- Know signs of labor

## Signs of Labor
- Regular, intensifying contractions
- Water breaking
- Bloody show
- Lower back pain

**Remember:** Every pregnancy is unique. Always consult your healthcare provider with concerns.`,
    readTime: 8,
    createdAt: new Date(),
  },
  {
    id: "4",
    title: "Fertility Awareness",
    category: "pregnancy",
    excerpt: "Learn about fertility signs, ovulation tracking, and optimizing your chances of conception.",
    content: `# Fertility Awareness

Understanding your fertility can help whether you're trying to conceive or avoid pregnancy. Here's what you need to know.

## Understanding Ovulation

Ovulation typically occurs about 14 days before your next period. During this time:
- An egg is released from the ovary
- The egg survives 12-24 hours
- Sperm can survive up to 5 days
- Your fertile window is about 6 days

## Fertility Signs

### Cervical Mucus
- **Dry/Sticky:** Low fertility
- **Creamy:** Approaching fertility
- **Egg white consistency:** Peak fertility
- **Watery:** High fertility

### Basal Body Temperature (BBT)
- Temperature rises 0.5-1°F after ovulation
- Track with a BBT thermometer
- Chart daily for patterns

### Other Signs
- Mild pelvic pain (mittelschmerz)
- Increased libido
- Breast tenderness
- Light spotting

## Tracking Methods

### Calendar Method
- Track cycle length for 6+ months
- Identify your shortest and longest cycles
- Calculate fertile window

### Ovulation Predictor Kits (OPKs)
- Detect LH surge before ovulation
- Test 1-2 days before expected ovulation
- Positive result means ovulation within 24-48 hours

### Apps and Devices
- Period tracking apps
- Wearable fertility monitors
- Smart thermometers

## Optimizing Fertility

### Lifestyle Factors
- Maintain healthy weight
- Exercise moderately
- Reduce stress
- Limit alcohol and caffeine
- Quit smoking

### Nutrition
- Folic acid (400-800 mcg daily)
- Iron-rich foods
- Antioxidant-rich fruits and vegetables
- Healthy fats

### Timing Intercourse
- Have sex every 1-2 days during fertile window
- Don't stress about specific positions
- Stay relaxed after intercourse

## When to Seek Help
Consider consulting a fertility specialist if:
- Under 35: No conception after 1 year
- Over 35: No conception after 6 months
- Irregular or absent periods
- Known reproductive issues`,
    readTime: 7,
    createdAt: new Date(),
  },
  {
    id: "5",
    title: "Understanding Menopause",
    category: "menopause",
    excerpt: "Navigate the transition through perimenopause and menopause with confidence and understanding.",
    content: `# Understanding Menopause

Menopause is a natural biological process marking the end of menstrual cycles. Understanding this transition can help you navigate it with confidence.

## Stages of Menopause

### Perimenopause
- Begins years before menopause
- Irregular periods and hormonal fluctuations
- Can last 4-8 years
- Symptoms often start in your 40s

### Menopause
- Defined as 12 consecutive months without a period
- Average age is 51
- Natural end of fertility
- Hormone levels stabilize

### Postmenopause
- Years following menopause
- Symptoms may ease
- Important to monitor bone and heart health

## Common Symptoms

### Physical
- Hot flashes and night sweats
- Sleep disturbances
- Vaginal dryness
- Weight gain, especially around the middle
- Thinning hair and dry skin
- Joint and muscle aches

### Emotional
- Mood swings
- Anxiety or irritability
- Difficulty concentrating
- Memory lapses

## Managing Symptoms

### Lifestyle Changes
- Regular exercise
- Balanced diet rich in calcium and vitamin D
- Limit caffeine and alcohol
- Dress in layers
- Keep bedroom cool

### Natural Remedies
- Black cohosh
- Evening primrose oil
- Mindfulness and yoga
- Acupuncture

### Medical Options
- Hormone Replacement Therapy (HRT)
- Low-dose antidepressants
- Vaginal estrogen
- Non-hormonal medications

Discuss options with your healthcare provider.

## Health Considerations

### Bone Health
- Bone density decreases after menopause
- Increase calcium intake
- Consider vitamin D supplements
- Weight-bearing exercises

### Heart Health
- Risk increases after menopause
- Maintain healthy cholesterol
- Monitor blood pressure
- Stay active

## Embracing the Change
Menopause is a new chapter, not an ending. Many women find:
- Freedom from periods and contraception
- New sense of purpose
- Time for self-focus
- Wisdom and confidence`,
    readTime: 7,
    createdAt: new Date(),
  },
  {
    id: "6",
    title: "Sexual Wellness and Health",
    category: "sexual-wellness",
    excerpt: "Essential information about sexual health, communication, and maintaining intimacy throughout life.",
    content: `# Sexual Wellness and Health

Sexual wellness is an important aspect of overall health. Here's comprehensive information to support your sexual well-being.

## Understanding Sexual Health

Sexual health encompasses:
- Physical well-being
- Emotional connection
- Communication skills
- Knowledge and awareness
- Consent and boundaries

## Common Concerns

### Libido Changes
Factors affecting desire:
- Hormonal changes
- Stress and fatigue
- Relationship issues
- Medications
- Life transitions

**Solutions:**
- Open communication with partner
- Stress management
- Prioritizing intimacy
- Consulting a healthcare provider

### Pain During Intercourse
Possible causes:
- Vaginal dryness
- Infections
- Endometriosis
- Muscle tension
- Skin conditions

**When to seek help:**
- Pain is persistent
- Accompanied by other symptoms
- Affects quality of life

### Sexual Function
Changes can occur due to:
- Aging
- Childbirth
- Menopause
- Medical conditions

## Maintaining Intimacy

### Communication
- Express needs and desires openly
- Listen to your partner
- Discuss boundaries
- Address concerns together

### Physical Connection
- Intimacy beyond intercourse
- Touch and affection
- Quality time together
- Trying new things together

### Self-Care
- Know your body
- Practice self-pleasure
- Maintain physical health
- Address mental health

## Protection and Prevention

### STI Prevention
- Use barrier methods
- Regular testing
- Open communication with partners
- Know your status

### Reproductive Health
- Regular gynecological exams
- Pap smears as recommended
- Breast self-exams
- HPV vaccination (if appropriate)

## Seeking Help

Don't hesitate to consult:
- Gynecologist
- Urologist
- Sex therapist
- Couples counselor

Remember: Sexual wellness is personal, and there's no "normal" - only what works for you.`,
    readTime: 6,
    createdAt: new Date(),
  },
];

const categoryIcons: Record<string, typeof BookOpen> = {
  pms: Thermometer,
  pregnancy: Baby,
  menopause: Sparkles,
  "sexual-wellness": Heart,
};

const categoryLabels: Record<string, string> = {
  pms: "PMS & Cycle",
  pregnancy: "Pregnancy",
  menopause: "Menopause",
  "sexual-wellness": "Sexual Wellness",
};

export default function Education() {
  const [selectedCategory, setSelectedCategory] = useState("pms");
  const [selectedArticle, setSelectedArticle] = useState<EducationalContent | null>(null);

  const { data: content, isLoading } = useQuery<EducationalContent[]>({
    queryKey: ["/api/educational-content"],
    placeholderData: defaultContent,
  });

  const displayContent = content || defaultContent;

  const filteredContent = displayContent.filter(
    (article) => article.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Educational Content
            </h1>
            <p className="text-muted-foreground mt-1">
              Learn about reproductive health, wellness, and self-care
            </p>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-card h-auto p-1">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const Icon = categoryIcons[key];
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    data-testid={`tab-${key}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.keys(categoryLabels).map((category) => (
              <TabsContent key={category} value={category} className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : filteredContent.length === 0 ? (
                  <Card className="bg-card border-card-border">
                    <CardContent className="p-8 text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-serif text-xl text-foreground mb-2">
                        No articles found
                      </h3>
                      <p className="text-muted-foreground">
                        Content for this category is coming soon.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredContent.map((article) => {
                    const Icon = categoryIcons[article.category];
                    return (
                      <Card
                        key={article.id}
                        className="bg-card border-card-border hover-elevate cursor-pointer transition-all duration-200"
                        onClick={() => setSelectedArticle(article)}
                        data-testid={`card-article-${article.id}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                              <Icon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg text-foreground mb-1">
                                {article.title}
                              </h3>
                              <p className="text-muted-foreground line-clamp-2 mb-3">
                                {article.excerpt}
                              </p>
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">
                                  {categoryLabels[article.category]}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span>{article.readTime} min read</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="bg-card border-card-border max-w-3xl max-h-[90vh] overflow-hidden">
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{categoryLabels[selectedArticle.category]}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedArticle.readTime} min read
                  </span>
                </div>
                <DialogTitle className="font-serif text-2xl">{selectedArticle.title}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-4">
                <div className="prose prose-invert max-w-none">
                  {selectedArticle.content.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('# ')) {
                      return null; // Skip the main title as we show it in header
                    }
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h2 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3">
                          {paragraph.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h3 key={index} className="text-lg font-medium text-foreground mt-4 mb-2">
                          {paragraph.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <p key={index} className="font-semibold text-foreground mt-3 mb-1">
                          {paragraph.replace(/\*\*/g, '')}
                        </p>
                      );
                    }
                    if (paragraph.startsWith('- ')) {
                      return (
                        <li key={index} className="text-muted-foreground ml-4">
                          {paragraph.replace('- ', '')}
                        </li>
                      );
                    }
                    if (paragraph.trim() === '') {
                      return null;
                    }
                    return (
                      <p key={index} className="text-muted-foreground mb-3">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
