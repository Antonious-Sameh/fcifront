import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { careerProgressAPI } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ChevronRight, ChevronLeft, RotateCcw,
  ExternalLink, Brain, Target, Zap, Users, Clock,
  TrendingUp, Shield, Smartphone, Database, Code2,
  Layout, Server, Layers, Bot, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ══════════════════════════════════════════════════════════════════
// 12 أسئلة — مقسمة على 4 محاور:
//   A) الاهتمامات والميول (3 أسئلة)
//   B) طريقة التفكير والشخصية (3 أسئلة)
//   C) المهارات والخلفية (3 أسئلة)
//   D) الأهداف المهنية (3 أسئلة)
// ══════════════════════════════════════════════════════════════════

// WEIGHT: كل إجابة بتعطي نقاط للتراكات المختلفة
// الـ scoring بيجمع النقاط ويطلع التراك الأعلى

const QUESTIONS = [
  // ─── A) الاهتمامات والميول ───────────────────────────────────────
  {
    id: 1,
    category: { ar: 'الاهتمامات والميول', en: 'Interests & Passions' },
    ar: 'لما بتشتغل على جهازك في وقت فراغك، إيه اللي بتعمله؟',
    en: 'When working on your computer in your free time, what do you usually do?',
    options: [
      { ar: 'بصمم واجهات وبجرب ألوان وأشكال', en: 'Designing interfaces and experimenting with colors/layouts', weights: { frontend: 3, fullstack: 1 } },
      { ar: 'بكتب كود وبحل مسائل منطقية', en: 'Writing code and solving logical problems', weights: { backend: 3, 'cs-foundation': 2, fullstack: 1 } },
      { ar: 'بحلل بيانات وبعمل جداول وأرقام', en: 'Analyzing data and making spreadsheets/charts', weights: { 'data-analysis': 3, 'ai-ml': 1 } },
      { ar: 'بجرب اختراق أنظمة وألعاب أمنية', en: 'Trying security challenges and CTF games', weights: { 'cyber-security': 3 } },
      { ar: 'بطور تطبيقات موبايل أو ألعاب', en: 'Building mobile apps or games', weights: { mobile: 3, frontend: 1 } },
      { ar: 'بتعلم مفاهيم نظرية وبقرأ عن الـ AI', en: 'Learning theoretical concepts and reading about AI', weights: { 'ai-ml': 3, 'cs-foundation': 2 } },
    ],
  },
  {
    id: 2,
    category: { ar: 'الاهتمامات والميول', en: 'Interests & Passions' },
    ar: 'إيه النوع ده بيمسك انتباهك أكتر لما بتتصفح الإنترنت؟',
    en: 'What type of content captures your attention most when browsing online?',
    options: [
      { ar: 'مقالات عن UI/UX وتصميم المنتجات', en: 'Articles about UI/UX and product design', weights: { frontend: 3, mobile: 1 } },
      { ar: 'فيديوهات عن System Design والـ Architecture', en: 'Videos about System Design and Architecture', weights: { backend: 3, 'cs-foundation': 2, fullstack: 1 } },
      { ar: 'تقارير عن الذكاء الاصطناعي والـ ML', en: 'Reports about AI and Machine Learning', weights: { 'ai-ml': 3, 'data-analysis': 1 } },
      { ar: 'أخبار الـ Hacking واكتشافات الثغرات', en: 'Hacking news and vulnerability discoveries', weights: { 'cyber-security': 3 } },
      { ar: 'مراجعات تطبيقات الجوال والأدوات الجديدة', en: 'Mobile app reviews and new tools', weights: { mobile: 3, frontend: 1 } },
      { ar: 'إحصائيات وأرقام عن أسواق واتجاهات', en: 'Statistics and market trends', weights: { 'data-analysis': 3, 'ai-ml': 1 } },
    ],
  },
  {
    id: 3,
    category: { ar: 'الاهتمامات والميول', en: 'Interests & Passions' },
    ar: 'لو هتبني مشروع لوحدك دلوقتي، إيه اللي هتختاره؟',
    en: "If you were to build a personal project right now, what would you choose?",
    options: [
      { ar: 'موقع أو تطبيق ويب بتصميم شيك', en: 'A beautiful website or web app', weights: { frontend: 3, fullstack: 2 } },
      { ar: 'API أو Backend system يخدم تطبيقات', en: 'An API or backend system serving applications', weights: { backend: 3, fullstack: 1 } },
      { ar: 'نموذج AI يحل مشكلة حقيقية', en: 'An AI model solving a real problem', weights: { 'ai-ml': 3, 'data-analysis': 1 } },
      { ar: 'Dashboard يحلل بيانات ويعرضها بصرياً', en: 'A dashboard analyzing and visualizing data', weights: { 'data-analysis': 3, 'ai-ml': 1 } },
      { ar: 'تطبيق موبايل يستخدمه الناس يومياً', en: 'A mobile app people use daily', weights: { mobile: 3, fullstack: 1 } },
      { ar: 'أداة أمنية تكشف ثغرات في الأنظمة', en: 'A security tool that detects system vulnerabilities', weights: { 'cyber-security': 3, 'cs-foundation': 1 } },
    ],
  },

  // ─── B) طريقة التفكير والشخصية ──────────────────────────────────
  {
    id: 4,
    category: { ar: 'طريقة التفكير والشخصية', en: 'Personality & Thinking Style' },
    ar: 'إيه اللي بيوصف طريقة تفكيرك أكتر؟',
    en: 'Which best describes your thinking style?',
    options: [
      { ar: 'إبداعي — بحب التجربة والابتكار البصري', en: 'Creative — I love experimentation and visual innovation', weights: { frontend: 3, mobile: 2 } },
      { ar: 'منطقي — بحل المشاكل خطوة بخطوة', en: 'Logical — I solve problems step by step', weights: { 'cs-foundation': 3, backend: 2, 'cyber-security': 1 } },
      { ar: 'تحليلي — بحب فهم الأنماط والأرقام', en: 'Analytical — I love understanding patterns and numbers', weights: { 'data-analysis': 3, 'ai-ml': 2 } },
      { ar: 'استراتيجي — بفكر في الصورة الكبيرة', en: 'Strategic — I think about the big picture', weights: { fullstack: 2, backend: 2, 'ai-ml': 1 } },
      { ar: 'فضولي — دايماً بسأل "إزاي ده اتعمل؟"', en: 'Curious — I always ask "how was this made?"', weights: { 'cs-foundation': 3, 'cyber-security': 2 } },
    ],
  },
  {
    id: 5,
    category: { ar: 'طريقة التفكير والشخصية', en: 'Personality & Thinking Style' },
    ar: 'لما بتواجه مشكلة صعبة في البرمجة، إيه ردة فعلك؟',
    en: 'When you face a difficult programming problem, how do you react?',
    options: [
      { ar: 'بزهق بسرعة وبدور على طريق أسهل', en: 'I get frustrated quickly and look for an easier way', weights: { frontend: 2, mobile: 2 } },
      { ar: 'بقعد ساعات وأنا بحاول أحلها، مش بتنازل', en: 'I spend hours trying, I never give up', weights: { 'cs-foundation': 3, 'cyber-security': 3, 'ai-ml': 2 } },
      { ar: 'بقسمها لأجزاء صغيرة وأحل كل جزء لوحده', en: 'I break it into small parts and solve each separately', weights: { backend: 3, fullstack: 2, 'data-analysis': 1 } },
      { ar: 'بدور على patterns مشابهة وبطبق نفس الحل', en: 'I look for similar patterns and apply the same solution', weights: { 'data-analysis': 3, 'ai-ml': 2 } },
      { ar: 'بطلب مساعدة من الـ community وبتعلم من التجارب', en: 'I ask the community and learn from their experiences', weights: { frontend: 1, mobile: 1, fullstack: 2 } },
    ],
  },
  {
    id: 6,
    category: { ar: 'طريقة التفكير والشخصية', en: 'Personality & Thinking Style' },
    ar: 'إيه أكتر حاجة بتحفزك لتكمل في التعلم؟',
    en: 'What motivates you most to keep learning?',
    options: [
      { ar: 'لما أشوف نتيجة شغلي فوراً قدامي (UI يتغير)', en: 'When I see my work results immediately (UI changes)', weights: { frontend: 3, mobile: 2 } },
      { ar: 'لما الـ API شغال ويرجع بيانات صح', en: 'When the API works and returns correct data', weights: { backend: 3, fullstack: 1 } },
      { ar: 'لما النموذج يطلع دقيق ويتوقع صح', en: 'When a model is accurate and predicts correctly', weights: { 'ai-ml': 3, 'data-analysis': 2 } },
      { ar: 'لما أكتشف ثغرة أو أحل تحدي أمني', en: 'When I discover a vulnerability or solve a security challenge', weights: { 'cyber-security': 3 } },
      { ar: 'لما الـ app بيشتغل smooth على الموبايل', en: 'When the app runs smoothly on mobile', weights: { mobile: 3, frontend: 1 } },
      { ar: 'لما أفهم مفهوم نظري كان صعب عليّ', en: 'When I understand a theoretical concept that was difficult', weights: { 'cs-foundation': 3, 'ai-ml': 1 } },
    ],
  },

  // ─── C) المهارات والخلفية ────────────────────────────────────────
  {
    id: 7,
    category: { ar: 'المهارات والخلفية', en: 'Skills & Background' },
    ar: 'إيه مستواك في الرياضيات والإحصاء؟',
    en: 'What is your level in mathematics and statistics?',
    options: [
      { ar: 'ممتاز — بحب Linear Algebra والإحصاء', en: 'Excellent — I love Linear Algebra and Statistics', weights: { 'ai-ml': 3, 'data-analysis': 2, 'cs-foundation': 1 } },
      { ar: 'كويس — مشكلتيش معاه ومتوسط', en: 'Good — no major issues, average level', weights: { backend: 2, 'cyber-security': 1, fullstack: 1 } },
      { ar: 'عادي — بستخدمه لو اضطريت بس', en: 'Average — I use it only when necessary', weights: { frontend: 2, mobile: 2 } },
      { ar: 'ضعيف — مش مجال قوتي خالص', en: 'Weak — definitely not my strong suit', weights: { frontend: 3, mobile: 2 } },
    ],
  },
  {
    id: 8,
    category: { ar: 'المهارات والخلفية', en: 'Skills & Background' },
    ar: 'إيه اللغات والتقنيات اللي جربتها قبل كده؟',
    en: 'Which languages or technologies have you tried before?',
    options: [
      { ar: 'HTML, CSS, JavaScript — واجهة ويب', en: 'HTML, CSS, JavaScript — web frontend', weights: { frontend: 3, fullstack: 2 } },
      { ar: 'Python — تحليل بيانات أو automation', en: 'Python — data analysis or automation', weights: { 'data-analysis': 2, 'ai-ml': 2, backend: 1 } },
      { ar: 'Java أو C++ — برمجة كائنية منظمة', en: 'Java or C++ — structured object-oriented programming', weights: { backend: 2, 'cs-foundation': 2, mobile: 1 } },
      { ar: 'SQL — قواعد بيانات واستعلامات', en: 'SQL — databases and queries', weights: { backend: 2, 'data-analysis': 2 } },
      { ar: 'Linux Terminal أو Bash Scripts', en: 'Linux Terminal or Bash Scripts', weights: { 'cyber-security': 3, backend: 1 } },
      { ar: 'لسه بدري — ما جربتش كتير', en: 'Still early — haven\'t tried much yet', weights: { 'cs-foundation': 3, frontend: 1 } },
    ],
  },
  {
    id: 9,
    category: { ar: 'المهارات والخلفية', en: 'Skills & Background' },
    ar: 'قد إيه وقتك ومجهودك اللي قادر تديه للتعلم؟',
    en: 'How much time and effort can you dedicate to learning?',
    options: [
      { ar: 'مستعد أتعب جداً لسنوات — عاوز نتيجة قوية', en: 'Ready to work very hard for years — I want strong results', weights: { 'ai-ml': 3, 'cs-foundation': 3, 'cyber-security': 2 } },
      { ar: '2-3 ساعات يومياً بانتظام', en: '2-3 hours daily consistently', weights: { backend: 2, frontend: 2, fullstack: 2 } },
      { ar: 'بدور على حاجة تجيب نتيجة أسرع', en: 'I am looking for something that gives faster results', weights: { frontend: 3, mobile: 2, 'data-analysis': 1 } },
      { ar: 'شغل وتعلم مع بعض — مش متفرغ كامل', en: 'Working and learning together — not fully dedicated', weights: { fullstack: 2, frontend: 1, 'data-analysis': 1 } },
    ],
  },

  // ─── D) الأهداف المهنية ──────────────────────────────────────────
  {
    id: 10,
    category: { ar: 'الأهداف المهنية', en: 'Career Goals' },
    ar: 'إيه هدفك المهني الأساسي خلال 3 سنوات؟',
    en: 'What is your main career goal in the next 3 years?',
    options: [
      { ar: 'وظيفة في شركة تك كبيرة (Google, Amazon, etc)', en: 'Job at a big tech company (Google, Amazon, etc)', weights: { 'cs-foundation': 3, 'ai-ml': 2, backend: 2 } },
      { ar: 'Freelancer ناجح بمشاريع من Google وUpwork', en: 'Successful freelancer with projects from Google/Upwork', weights: { fullstack: 3, frontend: 2, mobile: 2 } },
      { ar: 'تأسيس Startup أو product خاص بيك', en: 'Founding a Startup or your own product', weights: { fullstack: 3, mobile: 2, frontend: 1 } },
      { ar: 'متخصص في مجال أمني أو حكومي', en: 'Specialist in security or government sector', weights: { 'cyber-security': 3 } },
      { ar: 'باحث أو أكاديمي في الذكاء الاصطناعي', en: 'Researcher or academic in Artificial Intelligence', weights: { 'ai-ml': 3, 'data-analysis': 2 } },
      { ar: 'مدير تقني أو Tech Lead في شركة', en: 'Technical Manager or Tech Lead at a company', weights: { fullstack: 2, backend: 2, 'cs-foundation': 2 } },
    ],
  },
  {
    id: 11,
    category: { ar: 'الأهداف المهنية', en: 'Career Goals' },
    ar: 'إيه أهم حاجة بالنسبالك في شغلك المستقبلي؟',
    en: 'What is most important to you in your future job?',
    options: [
      { ar: 'مرتب عالي ومكافآت كبيرة', en: 'High salary and big bonuses', weights: { 'ai-ml': 2, 'cyber-security': 2, backend: 2 } },
      { ar: 'حرية الإبداع وعمل حاجات جميلة', en: 'Creative freedom and building beautiful things', weights: { frontend: 3, mobile: 2 } },
      { ar: 'تحدي تقني مستمر ومشاكل صعبة', en: 'Continuous technical challenge and difficult problems', weights: { 'cs-foundation': 3, 'cyber-security': 2, 'ai-ml': 1 } },
      { ar: 'Remote Work ومرونة في الوقت', en: 'Remote work and schedule flexibility', weights: { fullstack: 3, frontend: 2, 'data-analysis': 1 } },
      { ar: 'التأثير في حياة ناس كتير من خلال المنتج', en: 'Impacting many people\'s lives through the product', weights: { mobile: 3, fullstack: 2, frontend: 1 } },
      { ar: 'استمرارية التعلم والنمو الأكاديمي', en: 'Continuous learning and academic growth', weights: { 'ai-ml': 3, 'cs-foundation': 2, 'data-analysis': 1 } },
    ],
  },
  {
    id: 12,
    category: { ar: 'الأهداف المهنية', en: 'Career Goals' },
    ar: 'أي بيئة عمل بتناسبك أكتر؟',
    en: 'Which work environment suits you best?',
    options: [
      { ar: 'Startup صغيرة — سريعة ومتحركة', en: 'Small startup — fast-paced and dynamic', weights: { fullstack: 3, frontend: 2, mobile: 1 } },
      { ar: 'شركة كبيرة — منظمة وفيها مسار واضح', en: 'Large company — organized with a clear career path', weights: { backend: 2, 'cs-foundation': 2, 'data-analysis': 1 } },
      { ar: 'Freelance — بشتغل على مشاريع مختلفة', en: 'Freelance — working on diverse projects', weights: { fullstack: 3, frontend: 2, mobile: 2 } },
      { ar: 'بيئة بحثية — جامعة أو مختبر', en: 'Research environment — university or lab', weights: { 'ai-ml': 3, 'data-analysis': 2, 'cs-foundation': 1 } },
      { ar: 'حكومة أو بنوك — أمان واستقرار', en: 'Government or banks — security and stability', weights: { 'cyber-security': 2, backend: 1, 'data-analysis': 1 } },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════
// Track Info
// ══════════════════════════════════════════════════════════════════
const TRACK_INFO = {
  frontend:         { ar: 'تطوير الواجهات',         en: 'Frontend Development',    icon: Layout,   color: 'blue',   desc: { ar: 'بناء واجهات مستخدم جميلة وتفاعلية', en: 'Building beautiful interactive UIs' } },
  backend:          { ar: 'تطوير الخوادم',           en: 'Backend Development',     icon: Server,   color: 'emerald',desc: { ar: 'بناء APIs وأنظمة الخوادم', en: 'Building APIs and server systems' } },
  fullstack:        { ar: 'المطور الشامل',           en: 'Full Stack Development',  icon: Layers,   color: 'violet', desc: { ar: 'فرونت + باك + ديبلوي كامل', en: 'Frontend + Backend + Full deployment' } },
  mobile:           { ar: 'تطوير تطبيقات الجوال',   en: 'Mobile Development',      icon: Smartphone,color: 'rose',  desc: { ar: 'تطبيقات Android وiOS', en: 'Android and iOS applications' } },
  'data-analysis':  { ar: 'تحليل البيانات',         en: 'Data Analysis',           icon: Database, color: 'amber',  desc: { ar: 'تحليل البيانات وبناء Dashboards', en: 'Data analysis and dashboard building' } },
  'ai-ml':          { ar: 'الذكاء الاصطناعي وML',   en: 'AI & Machine Learning',   icon: Bot,      color: 'purple', desc: { ar: 'نماذج تعلم الآلة والذكاء الاصطناعي', en: 'ML models and AI systems' } },
  'cyber-security': { ar: 'الأمن السيبراني',         en: 'Cyber Security',          icon: Shield,   color: 'cyan',   desc: { ar: 'حماية الأنظمة واكتشاف الثغرات', en: 'System protection and vulnerability discovery' } },
  'cs-foundation':  { ar: 'تأسيس علوم الحاسب',     en: 'CS Foundation',           icon: Brain,    color: 'gray',   desc: { ar: 'الأساس القوي لأي مسار تقني', en: 'The strong base for any tech path' } },
};

const COLOR_CLASSES = {
  blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-600',   border: 'border-blue-500/30',   solid: 'bg-blue-500',   ring: 'ring-blue-500/20'   },
  emerald:{ bg: 'bg-emerald-500/10',text: 'text-emerald-600',border: 'border-emerald-500/30',solid: 'bg-emerald-500',ring: 'ring-emerald-500/20' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/30', solid: 'bg-violet-500', ring: 'ring-violet-500/20'  },
  rose:   { bg: 'bg-rose-500/10',   text: 'text-rose-600',   border: 'border-rose-500/30',   solid: 'bg-rose-500',   ring: 'ring-rose-500/20'   },
  amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-600',  border: 'border-amber-500/30',  solid: 'bg-amber-500',  ring: 'ring-amber-500/20'  },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30', solid: 'bg-purple-500', ring: 'ring-purple-500/20' },
  cyan:   { bg: 'bg-cyan-500/10',   text: 'text-cyan-600',   border: 'border-cyan-500/30',   solid: 'bg-cyan-500',   ring: 'ring-cyan-500/20'   },
  gray:   { bg: 'bg-gray-500/10',   text: 'text-gray-600',   border: 'border-gray-500/30',   solid: 'bg-gray-500',   ring: 'ring-gray-500/20'   },
};
const getCol = (c) => COLOR_CLASSES[c] || COLOR_CLASSES.blue;

// ── Personality insights بناءً على النتائج ─────────────────────────
const getPersonalityInsight = (topTrack, language) => {
  const isAr = language === 'ar';
  const insights = {
    frontend:         { ar: 'أنت شخص إبداعي يحب الجمال والتفاصيل البصرية — تفكيرك يربط بين الفن والتقنية بشكل رائع', en: 'You are a creative person who loves beauty and visual details — you brilliantly connect art and technology' },
    backend:          { ar: 'أنت شخص منطقي ومنظم يحب بناء الأنظمة القوية — طريقة تفكيرك المنهجية ميزتك الأكبر', en: 'You are a logical and organized person who loves building robust systems — your systematic thinking is your greatest strength' },
    fullstack:        { ar: 'أنت شخص شامل ومتعدد المواهب — تحب التحكم في المشروع كله وترى الصورة الكبيرة', en: 'You are a well-rounded, multi-talented person — you love controlling the whole project and seeing the big picture' },
    mobile:           { ar: 'أنت شخص عملي يحب التأثير المباشر على حياة الناس من خلال تطبيقات يستخدمونها يومياً', en: 'You are a practical person who loves directly impacting people\'s lives through apps they use daily' },
    'data-analysis':  { ar: 'أنت شخص تحليلي ودقيق — تجد المعنى في الأرقام وتحول البيانات لقرارات ذكية', en: 'You are an analytical and precise person — you find meaning in numbers and turn data into smart decisions' },
    'ai-ml':          { ar: 'أنت شخص فضولي ومحب للبحث والابتكار — تفكيرك العلمي مؤهلك لتغيير العالم بالذكاء الاصطناعي', en: 'You are a curious, research-loving innovator — your scientific thinking qualifies you to change the world with AI' },
    'cyber-security': { ar: 'أنت شخص تحبّ التحدي والألغاز المعقدة — عقلك التحليلي والاستراتيجي مثالي لحماية الأنظمة', en: 'You love challenges and complex puzzles — your analytical and strategic mind is perfect for protecting systems' },
    'cs-foundation':  { ar: 'أنت شخص يريد بناء أساس قوي قبل التخصص — هذا يدل على نضج تفكير وبُعد نظر ممتاز', en: 'You want to build a strong foundation before specializing — this shows mature thinking and excellent foresight' },
  };
  return insights[topTrack]?.[isAr ? 'ar' : 'en'] || '';
};

// ── Weighted scoring algorithm ────────────────────────────────────
const calculateResults = (answers) => {
  const scores = {};
  answers.forEach(weights => {
    Object.entries(weights).forEach(([track, points]) => {
      scores[track] = (scores[track] || 0) + points;
    });
  });
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([track, score]) => ({ track, score }));
};

// ══════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════
const CATEGORY_ICONS = { 0: Target, 1: Brain, 2: TrendingUp, 3: Users };

export default function CareerQuizPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { isAuthenticated } = useAuth();
  const [quizSaved, setQuizSaved] = useState(false);
  const [step, setStep] = useState(0); // 0 = intro
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState(null);

  const currentQ = QUESTIONS[step - 1];
  const progress = step > 0 ? (step / QUESTIONS.length) * 100 : 0;

  // Category grouping for progress display
  const categories = [
    { ar: 'الاهتمامات', en: 'Interests', range: [1, 3] },
    { ar: 'الشخصية', en: 'Personality', range: [4, 6] },
    { ar: 'المهارات', en: 'Skills', range: [7, 9] },
    { ar: 'الأهداف', en: 'Goals', range: [10, 12] },
  ];

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);
    if (step === QUESTIONS.length) {
      const res = calculateResults(newAnswers);
      setResults(res);
      
      // حفظ أعلى مسار طلع للطالب في الـ DB تلقائياً
      if (isAuthenticated && res[0]) {
        careerProgressAPI.save(res[0].track, [], {}).catch(() => {});
        setQuizSaved(true);
      }
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    setStep(s => s - 1);
    setAnswers(a => a.slice(0, -1));
    setSelected(null);
  };

  const reset = () => { setStep(0); setAnswers([]); setSelected(null); setResults(null); };

  const topInsight = results ? getPersonalityInsight(results[0]?.track, language) : '';

  return (
    <>
      <Helmet><title>{isAr ? 'اكتشف مسارك' : 'Find Your Track'} | Student Core</title></Helmet>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-2 md:px-4 py-8" dir={isAr ? 'rtl' : 'ltr'}>

          {/* ── Intro ── */}
          {step === 0 && !results && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
              <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-black mb-3">{isAr ? 'اكتشف مسارك المهني' : 'Find Your Career Track'}</h1>
              <p className="text-muted-foreground text-lg mb-4 leading-relaxed max-w-lg mx-auto">
                {isAr
                  ? '12 سؤال متخصص تغطي ميولك وشخصيتك ومهاراتك وأهدافك لنوصيك بأنسب مسار مهني'
                  : '12 specialized questions covering your interests, personality, skills, and goals to recommend the best career track'}
              </p>

              {/* Category preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 text-sm">
                {categories.map((cat, i) => {
                  const Icon = CATEGORY_ICONS[i];
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border">
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="font-medium text-xs">{isAr ? cat.ar : cat.en}</span>
                      <span className="text-xs text-muted-foreground">3 {isAr ? 'أسئلة' : 'questions'}</span>
                    </div>
                  );
                })}
              </div>

              <div className={cn('flex items-center justify-center gap-4 text-sm text-muted-foreground mb-8', isAr && 'flex-row-reverse')}>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {isAr ? '5 دقائق تقريباً' : '~5 minutes'}</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {isAr ? '12 سؤال' : '12 questions'}</span>
                <span className="flex items-center gap-1"><Target className="w-4 h-4" /> {isAr ? '3 توصيات' : '3 recommendations'}</span>
              </div>

              <button onClick={() => setStep(1)}
                className="px-10 py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                {isAr ? '← ابدأ الاختبار' : 'Start Quiz →'}
              </button>
            </motion.div>
          )}

          {/* ── Question ── */}
          {step > 0 && !results && (
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: isAr ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isAr ? 20 : -20 }} transition={{ duration: 0.22 }}>

                {/* Category badge */}
                <div className={cn('flex items-center gap-2 mb-4', isAr && 'flex-row-reverse')}>
                  <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium">
                    {isAr ? currentQ.category.ar : currentQ.category.en}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isAr ? `${step} من ${QUESTIONS.length}` : `${step} of ${QUESTIONS.length}`}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div className="h-full bg-primary rounded-full"
                      initial={{ width: `${((step - 1) / QUESTIONS.length) * 100}%` }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.4 }} />
                  </div>
                  {/* Category dots */}
                  <div className={cn('flex gap-2 mt-2 justify-center')}>
                    {QUESTIONS.map((_, i) => (
                      <div key={i} className={cn('h-1 rounded-full transition-all', i < step ? 'bg-primary flex-1' : 'bg-muted flex-1')} />
                    ))}
                  </div>
                </div>

                {/* Question */}
                <h2 className={cn('text-xl font-black mb-5 leading-snug', isAr && 'text-right')}>
                  {isAr ? currentQ.ar : currentQ.en}
                </h2>

                {/* Options */}
                <div className="space-y-2.5 mb-7">
                  {currentQ.options.map((opt, i) => (
                    <button key={i} onClick={() => setSelected(opt.weights)}
                      className={cn(
                        'w-full text-start px-5 py-3.5 rounded-xl border-2 transition-all text-sm font-medium',
                        JSON.stringify(selected) === JSON.stringify(opt.weights)
                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                          : 'border-border hover:border-primary/40 hover:bg-muted/40',
                        isAr && 'text-right'
                      )}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>

                {/* Nav */}
                <div className={cn('flex items-center justify-between', isAr && 'flex-row-reverse')}>
                  <button onClick={handleBack} disabled={step === 1}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    {isAr ? 'السابق' : 'Previous'}
                  </button>
                  <button onClick={handleNext} disabled={!selected}
                    className={cn('flex items-center gap-2 px-7 py-2.5 rounded-xl font-semibold transition-all text-sm',
                      selected ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md' : 'bg-muted text-muted-foreground cursor-not-allowed'
                    )}>
                    {step === QUESTIONS.length ? (isAr ? 'عرض النتيجة 🎯' : 'Show Results 🎯') : (isAr ? 'التالي' : 'Next')}
                    {step < QUESTIONS.length && (isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* ── Results ── */}
          {results && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">🎯</div>
                <h2 className="text-3xl font-black mb-2">{isAr ? 'نتيجتك جاهزة!' : 'Your Results!'}</h2>
                {/* Personality insight */}
                {topInsight && (
                  <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed italic mt-2 px-4 py-3 bg-muted/30 rounded-xl border border-border">
                    "{topInsight}"
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-8">
                {results.map(({ track, score }, i) => {
                  const info = TRACK_INFO[track];
                  if (!info) return null;
                  const col = getCol(info.color);
                  const Icon = info.icon;
                  const medals = ['🥇', '🥈', '🥉'];
                  const labels = {
                    ar: ['الأنسب لك تماماً', 'مناسب جداً', 'يستحق النظر'],
                    en: ['Best match for you', 'Very suitable', 'Worth considering'],
                  };
                  const maxScore = results[0].score;
                  const pct = Math.round((score / maxScore) * 100);

                  return (
                    <motion.div key={track} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className={cn('rounded-2xl border-2 p-5', col.border)}>
                      <div className={cn('flex items-start gap-4', isAr && 'flex-row-reverse')}>
                        <div className="text-2xl shrink-0">{medals[i]}</div>
                        <div className={cn('p-2.5 rounded-xl shrink-0', col.bg)}>
                          <Icon className={cn('w-5 h-5', col.text)} />
                        </div>
                        <div className={cn('flex-1 min-w-0', isAr && 'text-right')}>
                          <p className="font-bold text-base">{isAr ? info.ar : info.en}</p>
                          <p className="text-xs text-muted-foreground mb-2">{isAr ? info.desc.ar : info.desc.en}</p>
                          <p className={cn('text-xs font-medium', col.text)}>{labels[isAr ? 'ar' : 'en'][i]}</p>
                        </div>
                        <div className="shrink-0 text-center">
                          <p className={cn('text-xl font-black', col.text)}>{pct}%</p>
                          <p className="text-xs text-muted-foreground">{isAr ? 'توافق' : 'match'}</p>
                        </div>
                      </div>

                      {/* Match bar */}
                      <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div className={cn('h-full rounded-full', col.solid)}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }} />
                      </div>

                      <div className={cn('flex justify-end mt-3', isAr && 'justify-start')}>
                        <Link to={`/careers/${track}`}
                          className={cn('text-xs font-semibold flex items-center gap-1 hover:underline', col.text, isAr && 'flex-row-reverse')}>
                          {isAr ? 'استعرض المسار' : 'Explore Track'}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className={cn('flex flex-wrap gap-3', isAr ? 'justify-start' : 'justify-center')}>
                <button onClick={reset}
                  className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  <RotateCcw className="w-4 h-4" /> {isAr ? 'أعد الاختبار' : 'Retake Quiz'}
                </button>
                <Link to="/careers"
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                  {isAr ? 'كل المسارات' : 'All Tracks'}
                  <ChevronRight className={cn('w-4 h-4', isAr && 'rotate-180')} />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

