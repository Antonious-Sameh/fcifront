export const mockCourses = [
  { id: 'c1', title: 'Data Analysis', description: 'Learn Python, Pandas, and SQL for data analysis.', price: 49.99, category: 'Data Science', status: 'active' },
  { id: 'c2', title: 'Frontend Development', description: 'Master React, TailwindCSS, and modern web design.', price: 59.99, category: 'Web Development', status: 'active' },
  { id: 'c3', title: 'Backend Development', description: 'Build robust APIs with Node.js and Express.', price: 59.99, category: 'Web Development', status: 'active' },
  { id: 'c4', title: 'UI/UX Design', description: 'Learn Figma, wireframing, and user-centered design principles.', price: 39.99, category: 'Design', status: 'active' }
];

export const mockSubjects = [
  { id: 's1', name: 'Mathematics 101', term: 'Term 1', year: '1st Year' },
  { id: 's2', name: 'Physics 101', term: 'Term 1', year: '1st Year' },
  { id: 's3', name: 'Computer Science Basics', term: 'Term 2', year: '1st Year' }
];

export const mockCareers = [
  {
    id: 'foundation',
    nameKey: 'careers.paths.foundation.name',
    descKey: 'careers.paths.foundation.desc',
    whyKey: 'careers.paths.foundation.why',
    icon: 'BrainCircuit',
    levels: [
      {
        title: "Level 1: The Logic (التفكير البرمجي)",
        items: [
          { name: "C++ Programming", detail: "الأساس المتين لفهم الميموري والـ Syntax." },
          { name: "Problem Solving", detail: "حل 100+ مسألة على Codeforces (Level A & B)." }
        ]
      },
      {
        title: "Level 2: The Core (جوهر الحاسبات)",
        items: [
          { name: "OOP", detail: "برمجة الكائنات (Classes, Polymorphism, Inheritance)." },
          { name: "Data Structures", detail: "Arrays, Linked Lists, Trees, Graphs." },
          { name: "Algorithms", detail: "Sorting, Searching, Complexity (Big O)." }
        ]
      },
      {
        title: "Level 3: Computer Secrets",
        items: [
          { name: "Logic Design", detail: "إزاي الهاردوير بيفهم السوفتوير." },
          { name: "Discrete Math", detail: "الرياضيات المتقطعة أساس التشفير والمنطق." }
        ]
      }
    ]
  },
  {
    id: 'frontend',
    nameKey: 'careers.paths.frontend.name',
    descKey: 'careers.paths.frontend.desc',
    whyKey: 'careers.paths.frontend.why',
    icon: 'Layout',
    levels: [
      {
        title: "Phase 1: The Basics (أساسيات لا غنى عنها)",
        items: [
          { name: "HTML5 & CSS3", detail: "Semantics, Flexbox, CSS Grid." },
          { name: "JavaScript (ES6+)", detail: "DOM, Async/Await, Fetch API." },
          { name: "Tailwind CSS", detail: "تنسيق احترافي بأسلوب الـ Utility-first." }
        ]
      },
      {
        title: "Phase 2: Choose Your Weapon (اختر سلاحك)",
        isChoice: true, // علامة عشان نوضح إن دي مسارات اختيارية
        choices: [
          {
            path: "React.js Path",
            steps: ["React Hooks", "React Router", "Redux Toolkit / Zustand", "Next.js (SSR)"]
          },
          {
            path: "Angular Path",
            steps: ["TypeScript", "RxJS", "Components & Modules", "NGRX Store"]
          },
          {
            path: "Vue.js Path",
            steps: ["Vue Options/Composition API", "Vuex / Pinia", "Nuxt.js"]
          }
        ]
      }
    ]
  },
  {
    id: 'backend',
    nameKey: 'careers.paths.backend.name',
    descKey: 'careers.paths.backend.desc',
    whyKey: 'careers.paths.backend.why',
    icon: 'Server',
    levels: [
      {
        title: "Step 1: Programming Language",
        isChoice: true,
        choices: [
          { path: "Node.js", steps: ["Express.js", "Event Loop", "Streams"] },
          { path: ".NET (C#)", steps: ["ASP.NET Core", "Entity Framework", "LINQ"] },
          { path: "Python", steps: ["Django", "Flask", "FastAPI"] },
          { path: "PHP", steps: ["Laravel", "Blade", "Eloquent"] }
        ]
      },
      {
        title: "Step 2: Databases (قواعد البيانات)",
        items: [
          { name: "Relational (SQL)", detail: "PostgreSQL, MySQL, SQL Server." },
          { name: "NoSQL", detail: "MongoDB, Redis (Caching)." }
        ]
      },
      {
        title: "Step 3: Advanced Topics",
        items: [
          { name: "RESTful & GraphQL APIs", detail: "تصميم واجهات برمجة التطبيقات." },
          { name: "Docker", detail: "وضع المشروع في Container لسهولة الرفع." }
        ]
      }
    ]
  },
  {
    id: 'fullstack',
    nameKey: 'careers.paths.fullstack.name',
    descKey: 'careers.paths.fullstack.desc',
    whyKey: 'careers.paths.fullstack.why',
    icon: 'Layers',
    levels: [
      {
        title: "The Ultimate Path (الماستر)",
        items: [
          { name: "MERN Stack", detail: "MongoDB, Express, React, Node.js." },
          { name: "MEAN Stack", detail: "MongoDB, Express, Angular, Node.js." },
          { name: "DOTNET + React", detail: "React Frontend with .NET Core Backend." }
        ]
      }
    ]
  },
  {
    id: 'ai',
    nameKey: 'careers.paths.ai.name',
    descKey: 'careers.paths.ai.desc',
    whyKey: 'careers.paths.ai.why',
    icon: 'Bot',
    levels: [
      {
        title: "Level 1: Math & Python",
        items: [
          { name: "Python for Data Science", detail: "NumPy, Pandas, Matplotlib." },
          { name: "Mathematics", detail: "Linear Algebra, Calculus, Statistics." }
        ]
      },
      {
        title: "Level 2: AI Core",
        items: [
          { name: "Machine Learning", detail: "Regression, Classification, Clustering." },
          { name: "Deep Learning", detail: "Neural Networks, CNN, RNN, Transformers." }
        ]
      }
    ]
  }
];

export const mockDepartments = [
  { 
    id: 'cs', 
    name: 'Computer Science (علوم الحاسب)', 
    type: 'General',
    description: 'القسم الأقوى برمجياً. بيركز على الـ Software Engineering والـ Algorithms.',
    pros: 'مطلوب جداً، بيخليك فاهم "Under the hood" ماشي إزاي.',
    cons: 'دراسته تقيلة ومحتاجة مجهود عالي وصبر.',
    suitableFor: 'بتاع الكود اللي مبيزهقش وعاوز يشتغل في شركات كبيرة.'
  },
  { 
    id: 'is', 
    name: 'Information Systems (نظم المعلومات)', 
    type: 'General',
    description: 'مزيج بين البرمجة والـ Business. إزاي التكنولوجيا تخدم الشركات.',
    pros: 'شغله مريح، وبيركز على الـ Data Analysis والـ ERP Systems.',
    cons: 'البرمجة فيه مش بنفس قوة CS.',
    suitableFor: 'لو بتحب الإدارة، تنظيم البيانات، وعاوز شغل متوازن.'
  },
  { 
    id: 'ai-dept', 
    name: 'Artificial Intelligence (ذكاء اصطناعي)', 
    type: 'Special (Paid)',
    description: 'قسم بفلوس، بيركز على الروبوتات، تعلم الآلة، ومعالجة اللغات.',
    pros: 'مجال المستقبل، معامل مجهزة، وعدد طلاب أقل.',
    suitableFor: 'لو معاك ميزانية وعاوز تتخصص في أحدث حاجة في التكنولوجيا.'
  },
  { 
    id: 'cyber', 
    name: 'Cyber Security (الأمن السيبراني)', 
    type: 'Special (Paid)',
    description: 'حامي الحمي. بتتعلم إزاي تخترق الأنظمة (Ethical Hacking) وتأمنها.',
    pros: 'مرتبات خيالية وندرة في المتخصصين.',
    suitableFor: 'لو بتحب التحدي، حل الألغاز، وبتحب الـ Networking والـ OS.'
  }
];