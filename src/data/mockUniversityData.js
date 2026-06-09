export const academicYears = [
  { id: '1', key: 'year_1' },
  { id: '2', key: 'year_2' },
  { id: '3', key: 'year_3' },
  { id: '4', key: 'year_4' }
];

export const terms = [
  { id: '1', key: 'term_1' },
  { id: '2', key: 'term_2' }
];

// Structure: subjects[yearId][termId]
export const subjects = {
  '1': {
    '1': [
      { id: 'math-101', name: { en: 'Mathematics I', ar: 'الرياضيات ١' }, description: { en: 'Calculus and Algebra fundamentals', ar: 'أساسيات التفاضل والتكامل والجبر' } },
      { id: 'phy-101', name: { en: 'Physics I', ar: 'الفيزياء ١' }, description: { en: 'Mechanics and Thermodynamics', ar: 'الميكانيكا والديناميكا الحرارية' } },
      { id: 'cs-101', name: { en: 'Intro to Computer Science', ar: 'مقدمة في علوم الحاسب' }, description: { en: 'Programming basics in Python', ar: 'أساسيات البرمجة بلغة بايثون' } }
    ],
    '2': [
      { id: 'math-102', name: { en: 'Mathematics II', ar: 'الرياضيات ٢' }, description: { en: 'Advanced Calculus', ar: 'التفاضل والتكامل المتقدم' } }
    ]
  },
  '2': {
    '1': [
      { id: 'ds-201', name: { en: 'Data Structures', ar: 'هياكل البيانات' }, description: { en: 'Core data organization', ar: 'تنظيم البيانات الأساسي' } }
    ]
  }
};

export const subjectDetails = {
  'math-101': {
    lectures: [
      { id: 'l1', title: { en: 'Lecture 1: Intro to Limits', ar: 'المحاضرة ١: مقدمة في النهايات' }, videoId: 'pKQhD74nFks' },
      { id: 'l2', title: { en: 'Lecture 2: Derivatives', ar: 'المحاضرة ٢: المشتقات' }, videoId: 'pKQhD74nFks' }
    ],
    sections: [
      { id: 's1', title: { en: 'Section 1: Limits Practice', ar: 'السكشن ١: تمارين على النهايات' }, videoId: 'pKQhD74nFks' }
    ],
    assignments: [
      { id: 'a1', title: { en: 'Assignment 1', ar: 'الواجب الأول' }, description: { en: 'Solve problems 1-20 in Chapter 1', ar: 'حل المسائل من 1 إلى 20 في الفصل الأول' }, deadline: '2026-05-15' },
      { id: 'a2', title: { en: 'Project Phase 1', ar: 'المرحلة الأولى من المشروع' }, description: { en: 'Submit initial report', ar: 'تسليم التقرير المبدئي' }, deadline: '2026-05-25' }
    ]
  },
  'cs-101': {
    lectures: [
      { id: 'l1', title: { en: 'Lecture 1: What is Programming?', ar: 'المحاضرة ١: ما هي البرمجة؟' }, videoId: 'pKQhD74nFks' }
    ],
    sections: [],
    assignments: []
  }
};