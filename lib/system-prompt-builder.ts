/**
 * System Prompt Builder
 * بناء System Prompt احترافي باستخدام أفضل الممارسات
 * 
 * العناصر الأساسية:
 * 1. السياق (Context) - تحديد دور النموذج
 * 2. المهمة (Task) - تعليمات واضحة
 * 3. تنسيق الرد (Format) - كيفية تنظيم الإجابة
 * 4. النبرة (Tone) - أسلوب الكتابة
 * 5. أمثلة (Examples) - نماذج للردود المتوقعة
 */

export interface SystemPromptConfig {
  context: string;
  task: string[];
  format: {
    structure: string[];
    useMarkdown: boolean;
    codeBlocks?: boolean;
  };
  tone: 'formal' | 'friendly' | 'professional' | 'casual';
  style: 'direct' | 'detailed' | 'concise';
  examples?: Array<{
    question: string;
    response: string;
  }>;
  additionalRules?: string[];
  avoid?: string[];
  language?: 'ar' | 'en' | 'bilingual';
  responseLength?: 'short' | 'medium' | 'long' | 'custom';
}

/**
 * بناء System Prompt من التكوين
 */
export function buildSystemPrompt(config: SystemPromptConfig): string {
  const { context, task, format, tone, style, examples, additionalRules, avoid, language, responseLength } = config;

  let prompt = '';

  // 1. السياق / Context
  prompt += `# ${language === 'ar' ? 'السياق' : language === 'en' ? 'Context' : 'Context / السياق'}\n\n`;
  prompt += `${context}\n\n`;

  // 2. المهمة / Task
  prompt += `# ${language === 'ar' ? 'المهمة' : language === 'en' ? 'Task' : 'Task / المهمة'}\n\n`;
  task.forEach((t, i) => {
    prompt += `${i + 1}. ${t}\n`;
  });
  prompt += '\n';

  // 3. تنسيق الرد / Response Format
  prompt += `# ${language === 'ar' ? 'تنسيق الرد' : language === 'en' ? 'Response Format' : 'Response Format / تنسيق الرد'}\n\n`;
  if (format.useMarkdown) {
    prompt += `${language === 'ar' ? 'استخدم Markdown لتنظيم ردودك:' : language === 'en' ? 'Use Markdown to organize your responses:' : 'Use Markdown to organize your responses / استخدم Markdown لتنظيم ردودك:'}\n\n`;
  }
  prompt += `### ${language === 'ar' ? 'الهيكل المطلوب' : language === 'en' ? 'Required Structure' : 'Required Structure / الهيكل المطلوب'}:\n`;
  format.structure.forEach((s, i) => {
    prompt += `${i + 1}. ${s}\n`;
  });
  if (format.codeBlocks) {
    prompt += `\n${language === 'ar' ? '- استخدم كتل الكود عند الحاجة' : language === 'en' ? '- Use code blocks when needed' : '- Use code blocks when needed / استخدم كتل الكود عند الحاجة'}\n`;
  }
  prompt += '\n';

  // 4. النبرة / Tone
  prompt += `# ${language === 'ar' ? 'النبرة والأسلوب' : language === 'en' ? 'Tone and Style' : 'Tone and Style / النبرة والأسلوب'}\n\n`;
  prompt += `- ${language === 'ar' ? 'النبرة' : language === 'en' ? 'Tone' : 'Tone / النبرة'}: ${getToneText(tone, language)}\n`;
  prompt += `- ${language === 'ar' ? 'الأسلوب' : language === 'en' ? 'Style' : 'Style / الأسلوب'}: ${getStyleText(style, language)}\n`;
  if (responseLength) {
    prompt += `- ${language === 'ar' ? 'طول الإجابة' : language === 'en' ? 'Response Length' : 'Response Length / طول الإجابة'}: ${getLengthText(responseLength, language)}\n`;
  }
  prompt += '\n';

  // 5. أمثلة / Examples
  if (examples && examples.length > 0) {
    prompt += `# ${language === 'ar' ? 'أمثلة' : language === 'en' ? 'Examples' : 'Examples / أمثلة'}\n\n`;
    examples.forEach((ex, i) => {
      prompt += `### ${language === 'ar' ? 'مثال' : language === 'en' ? 'Example' : 'Example / مثال'} ${i + 1}:\n\n`;
      prompt += `**${language === 'ar' ? 'السؤال' : language === 'en' ? 'Question' : 'Question / السؤال'}:** ${ex.question}\n\n`;
      prompt += `**${language === 'ar' ? 'الرد المتوقع' : language === 'en' ? 'Expected Response' : 'Expected Response / الرد المتوقع'}:**\n${ex.response}\n\n`;
    });
  }

  // 6. القواعد الإضافية / Additional Rules
  if (additionalRules && additionalRules.length > 0) {
    prompt += `# ${language === 'ar' ? 'القواعد الإضافية' : language === 'en' ? 'Additional Rules' : 'Additional Rules / القواعد الإضافية'}\n\n`;
    additionalRules.forEach((rule) => {
      prompt += `- ${rule}\n`;
    });
    prompt += '\n';
  }

  // 7. ما يجب تجنبه / What to Avoid
  if (avoid && avoid.length > 0) {
    prompt += `# ${language === 'ar' ? 'ما يجب تجنبه' : language === 'en' ? 'What to Avoid' : 'What to Avoid / ما يجب تجنبه'}\n\n`;
    avoid.forEach((item) => {
      prompt += `- ❌ ${item}\n`;
    });
    prompt += '\n';
  }

  return prompt.trim();
}

function getToneText(tone: string, language?: string): string {
  const tones: Record<string, Record<string, string>> = {
    ar: {
      formal: 'رسمي',
      friendly: 'ودود',
      professional: 'احترافي',
      casual: 'عادي',
    },
    en: {
      formal: 'formal',
      friendly: 'friendly',
      professional: 'professional',
      casual: 'casual',
    },
  };

  if (language === 'bilingual') {
    return `${tones.en[tone]} / ${tones.ar[tone]}`;
  }

  return tones[language || 'en'][tone] || tone;
}

function getStyleText(style: string, language?: string): string {
  const styles: Record<string, Record<string, string>> = {
    ar: {
      direct: 'مباشر',
      detailed: 'مفصل',
      concise: 'مختصر',
    },
    en: {
      direct: 'direct',
      detailed: 'detailed',
      concise: 'concise',
    },
  };

  if (language === 'bilingual') {
    return `${styles.en[style]} / ${styles.ar[style]}`;
  }

  return styles[language || 'en'][style] || style;
}

function getLengthText(length: string, language?: string): string {
  const lengths: Record<string, Record<string, string>> = {
    ar: {
      short: 'مختصر (2-3 جمل)',
      medium: 'متوسط (4-6 جمل)',
      long: 'مفصل (7+ جمل)',
      custom: 'حسب الحاجة',
    },
    en: {
      short: 'short (2-3 sentences)',
      medium: 'medium (4-6 sentences)',
      long: 'detailed (7+ sentences)',
      custom: 'as needed',
    },
  };

  if (language === 'bilingual') {
    return `${lengths.en[length]} / ${lengths.ar[length]}`;
  }

  return lengths[language || 'en'][length] || length;
}

/**
 * أمثلة جاهزة للاستخدام / Ready-to-use Examples
 */

// مثال 1: مساعد برمجي (عربي/إنجليزي) / Example 1: Coding Assistant (Bilingual)
export const CODING_ASSISTANT_PROMPT_AR = buildSystemPrompt({
  context: 'أنت مساعد برمجي محترف متخصص في تطوير الويب والتطبيقات. / You are a professional coding assistant specialized in web and application development.',
  task: [
    'كتابة أكواد نظيفة وموثقة / Write clean, documented code',
    'شرح المفاهيم البرمجية بوضوح / Explain programming concepts clearly',
    'تقديم حلول عملية وقابلة للتطبيق / Provide practical, applicable solutions',
    'اقتراح أفضل الممارسات (best practices) / Suggest best practices',
  ],
  format: {
    structure: [
      'عنوان رئيسي يوضح الحل / Main heading explaining the solution',
      'شرح موجز (2-3 جمل) / Brief explanation (2-3 sentences)',
      'الكود مع التعليقات التوضيحية / Code with explanatory comments',
      'شرح الخطوات والمنطق / Step-by-step explanation and logic',
    ],
    useMarkdown: true,
    codeBlocks: true,
  },
  tone: 'professional',
  style: 'direct',
  examples: [
    {
      question: 'كيف أنشئ مكون React بسيط؟ / How do I create a simple React component?',
      response: `## الحل: مكون React بسيط / Solution: Simple React Component

إليك مثال على مكون React أساسي / Here's a basic React component example:

\`\`\`tsx
import React from 'react'

export default function MyComponent() {
  return <div>Hello World</div>
}
\`\`\`

**الشرح / Explanation:**
- استورد React من المكتبة / Import React from the library
- أنشئ دالة مكون (component function) / Create a component function
- أعد عنصر JSX بسيط / Return a simple JSX element`,
    },
  ],
  additionalRules: [
    'استخدم TypeScript عند الإمكان / Use TypeScript when possible',
    'اتبع معايير ESLint و Prettier / Follow ESLint and Prettier standards',
    'اكتب تعليقات واضحة بالعربية أو الإنجليزية / Write clear comments in Arabic or English',
  ],
  avoid: [
    'أكواد غير مكتملة أو تحتوي على TODO / Incomplete code or TODOs',
    'استخدام متغيرات غير معرفة / Using undefined variables',
    'نسخ كود بدون شرح / Copying code without explanation',
  ],
  language: 'bilingual',
  responseLength: 'medium',
});

// مثال 2: مساعد كتابة (عربي/إنجليزي) / Example 2: Writing Assistant (Bilingual)
export const WRITING_ASSISTANT_PROMPT_AR = buildSystemPrompt({
  context: 'أنت مساعد كتابة محترف متخصص في تحسين جودة المحتوى. / You are a professional writing assistant specialized in improving content quality.',
  task: [
    'تحسين جودة الكتابة / Improve writing quality',
    'تصحيح الأخطاء النحوية والإملائية / Fix grammar and spelling errors',
    'اقتراح تحسينات على الأسلوب / Suggest style improvements',
    'تقديم نصائح للكتابة / Provide writing tips',
  ],
  format: {
    structure: [
      'تحليل النص (ما يحتاج تحسين) / Text analysis (what needs improvement)',
      'النسخة المحسنة / Improved version',
      'شرح التغييرات / Explanation of changes',
      'نصائح عامة للكتابة / General writing tips',
    ],
    useMarkdown: true,
    codeBlocks: false,
  },
  tone: 'professional',
  style: 'detailed',
  examples: [
    {
      question: 'حسّن هذه الجملة: "البيانات تظهر أن..." / Improve this sentence: "The data shows that..."',
      response: `## تحسين الكتابة / Writing Improvement

**الأصل / Original:** "البيانات تظهر أن..." / "The data shows that..."
**المحسّن / Improved:** "البيانات تُظهر أن..." أو "تُظهر البيانات أن..." / "The data demonstrate that..."

**الشرح / Explanation:**
- استخدام الفعل المضارع بشكل صحيح / Use the present tense correctly
- يمكن تقديم الفعل أو تأخيره حسب السياق / Verb can be placed before or after subject based on context

**نصيحة / Tip:** راجع قواعد النحو عند استخدام الجموع / Always check grammar rules when using plurals.`,
    },
  ],
  language: 'bilingual',
  responseLength: 'medium',
});

/**
 * دالة مساعدة لإنشاء System Prompt مخصص
 */
export function createCustomSystemPrompt(
  config: Omit<SystemPromptConfig, 'language'> & { language?: 'ar' | 'en' | 'bilingual' }
): string {
  return buildSystemPrompt(config as SystemPromptConfig);
}

