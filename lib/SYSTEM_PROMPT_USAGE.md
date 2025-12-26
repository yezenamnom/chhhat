# دليل استخدام System Prompt Builder
# System Prompt Builder Usage Guide

## ✅ التكامل المكتمل / Integration Complete

تم دمج نظام **System Prompt Builder** مع الكود الموجود في المشروع.

The **System Prompt Builder** system has been integrated with the existing project code.

---

## 📁 الملفات المُنشأة / Created Files

### 1. `lib/system-prompt-template.md`
دليل شامل يشرح مبادئ System Prompt Engineering مع أمثلة عملية.

Comprehensive guide explaining System Prompt Engineering principles with practical examples.

### 2. `lib/system-prompt-builder.ts`
أداة TypeScript لبناء System Prompts برمجياً باستخدام أفضل الممارسات.

TypeScript tool for programmatically building System Prompts using best practices.

### 3. `lib/system-prompt-examples.ts`
أمثلة جاهزة للاستخدام (أكاديمي، تسويق، تعليمي).

Ready-to-use examples (academic, marketing, educational).

### 4. `lib/ai-training-prompt.ts` (محدث / Updated)
تم تحديثه لاستخدام النظام الجديد مع الحفاظ على التوافق.

Updated to use the new system while maintaining compatibility.

---

## 🚀 الاستخدام / Usage

### الطريقة 1: استخدام الدالة المحدثة (افتراضي)
### Method 1: Using the Updated Function (Default)

```typescript
import { getSystemPrompt } from '@/lib/ai-training-prompt'

// يستخدم النظام الجديد افتراضياً
// Uses the new system by default
const prompt = getSystemPrompt(
  isVoiceMode: boolean,
  deepThinking: boolean,
  language: string,
  focusMode: "general" | "academic" | "writing" | "code"
)
```

### الطريقة 2: استخدام Builder مباشرة
### Method 2: Using Builder Directly

```typescript
import { buildSystemPrompt } from '@/lib/system-prompt-builder'

const customPrompt = buildSystemPrompt({
  context: 'أنت مساعد ذكي...',
  task: ['المهمة 1', 'المهمة 2'],
  format: {
    structure: ['عنوان', 'قائمة', 'شرح'],
    useMarkdown: true,
    codeBlocks: true,
  },
  tone: 'professional',
  style: 'direct',
  language: 'bilingual',
  responseLength: 'medium',
})
```

### الطريقة 3: استخدام الأمثلة الجاهزة
### Method 3: Using Ready-made Examples

```typescript
import { 
  CODING_ASSISTANT_PROMPT_AR,
  WRITING_ASSISTANT_PROMPT_AR,
  ACADEMIC_ASSISTANT_PROMPT,
  MARKETING_ASSISTANT_PROMPT,
  EDUCATIONAL_ASSISTANT_PROMPT,
  ADVANCED_MULTILINGUAL_PROMPT,
  ADVANCED_MULTILINGUAL_PROMPT_AR,
  createDomainPrompt
} from '@/lib/system-prompt-examples'

// استخدام مثال جاهز
// Use a ready-made example
const codingPrompt = CODING_ASSISTANT_PROMPT_AR

// أو إنشاء prompt حسب المجال
// Or create a prompt by domain
const academicPrompt = createDomainPrompt('academic', 'bilingual')

// استخدام النظام المتقدم متعدد اللغات
// Use advanced multilingual system
const advancedPrompt = ADVANCED_MULTILINGUAL_PROMPT_AR
```

### الطريقة 4: استخدام النظام المتقدم متعدد اللغات
### Method 4: Using Advanced Multilingual System

```typescript
import { getSystemPrompt, getAdvancedMultilingualPrompt } from '@/lib/ai-training-prompt'

// استخدام النظام المتقدم مع getSystemPrompt
// Use advanced system with getSystemPrompt
const prompt1 = getSystemPrompt(
  false, // isVoiceMode
  true,  // deepThinking
  'ar',  // language
  'general', // focusMode
  true,  // useAdvancedBuilder
  true   // useMultilingualAdvanced ← النظام المتقدم
)

// أو استخدام الدالة المخصصة
// Or use the dedicated function
const prompt2 = getAdvancedMultilingualPrompt('bilingual')
```

---

## 🔧 التكوين / Configuration

### العناصر الأساسية / Core Elements

1. **السياق (Context)**: تحديد دور النموذج
2. **المهمة (Task)**: تعليمات واضحة
3. **تنسيق الرد (Format)**: كيفية تنظيم الإجابة
4. **النبرة (Tone)**: أسلوب الكتابة
5. **أمثلة (Examples)**: نماذج للردود المتوقعة

### الخيارات المتاحة / Available Options

```typescript
interface SystemPromptConfig {
  context: string
  task: string[]
  format: {
    structure: string[]
    useMarkdown: boolean
    codeBlocks?: boolean
  }
  tone: 'formal' | 'friendly' | 'professional' | 'casual'
  style: 'direct' | 'detailed' | 'concise'
  examples?: Array<{
    question: string
    response: string
  }>
  additionalRules?: string[]
  avoid?: string[]
  language?: 'ar' | 'en' | 'bilingual'
  responseLength?: 'short' | 'medium' | 'long' | 'custom'
}
```

---

## 📝 أمثلة عملية / Practical Examples

### مثال 1: مساعد برمجي مخصص
### Example 1: Custom Coding Assistant

```typescript
import { buildSystemPrompt } from '@/lib/system-prompt-builder'

const myCodingPrompt = buildSystemPrompt({
  context: 'أنت مساعد برمجي متخصص في React و Next.js',
  task: [
    'كتابة مكونات React نظيفة',
    'استخدام TypeScript',
    'اتباع أفضل الممارسات',
  ],
  format: {
    structure: ['الحل', 'الكود', 'الشرح'],
    useMarkdown: true,
    codeBlocks: true,
  },
  tone: 'professional',
  style: 'direct',
  language: 'bilingual',
})
```

### مثال 2: مساعد كتابة
### Example 2: Writing Assistant

```typescript
const writingPrompt = buildSystemPrompt({
  context: 'أنت محرر محترف',
  task: ['تحسين الجودة', 'تصحيح الأخطاء'],
  format: {
    structure: ['التحليل', 'النسخة المحسنة', 'الشرح'],
    useMarkdown: true,
  },
  tone: 'professional',
  style: 'detailed',
  language: 'ar',
})
```

---

## 🔄 التوافق مع الكود الموجود
## Compatibility with Existing Code

تم الحفاظ على التوافق الكامل مع الكود الموجود:

Full compatibility with existing code has been maintained:

- ✅ جميع الاستدعاءات الموجودة تعمل بدون تغيير
- ✅ يمكن استخدام النظام القديم بإضافة `useAdvancedBuilder: false`
- ✅ النظام الجديد هو الافتراضي

- ✅ All existing calls work without changes
- ✅ Old system can be used by adding `useAdvancedBuilder: false`
- ✅ New system is the default

---

## 🌟 النظام المتقدم متعدد اللغات
## Advanced Multilingual System

تم إضافة نظام متقدم متعدد اللغات مع الميزات التالية:

An advanced multilingual system has been added with the following features:

### الميزات / Features:
- ✅ **البحث والاستشهادات** - استخدام [source:number] لكل ادعاء واقعي
- ✅ **متعدد اللغات** - التكيف التلقائي مع لغة المستخدم
- ✅ **الاستدلال** - تحليل الأسئلة المعقدة بشكل منطقي
- ✅ **الحساسية الثقافية** - التكيف مع السياق الثقافي لكل لغة

- ✅ **Research & Citations** - Use [source:number] for every factual claim
- ✅ **Multilingual** - Automatic adaptation to user's language
- ✅ **Reasoning** - Logical analysis of complex questions
- ✅ **Cultural Sensitivity** - Adaptation to cultural context for each language

### الاستخدام / Usage:

```typescript
// الطريقة 1: مع getSystemPrompt
const prompt = getSystemPrompt(
  false, false, 'ar', 'general', true, true // useMultilingualAdvanced = true
)

// الطريقة 2: دالة مخصصة
import { getAdvancedMultilingualPrompt } from '@/lib/ai-training-prompt'
const prompt = getAdvancedMultilingualPrompt('bilingual')

// الطريقة 3: مباشرة
import { ADVANCED_MULTILINGUAL_PROMPT_AR } from '@/lib/system-prompt-examples'
const prompt = ADVANCED_MULTILINGUAL_PROMPT_AR
```

## 📚 المزيد من المعلومات
## More Information

راجع الملفات التالية لمزيد من التفاصيل:

Check the following files for more details:

- `lib/system-prompt-template.md` - دليل شامل / Comprehensive guide
- `lib/system-prompt-builder.ts` - الكود الأساسي / Core code
- `lib/system-prompt-examples.ts` - أمثلة عملية + النظام المتقدم / Practical examples + Advanced system

---

## 🎯 أفضل الممارسات
## Best Practices

1. ✅ استخدم تعليمات واضحة ومباشرة
2. ✅ نظم التعليمات بشكل هرمي باستخدام Markdown
3. ✅ حدد طول الإجابة المطلوب
4. ✅ أضف أمثلة عند الحاجة
5. ✅ اختبر وتعدل حسب الحاجة

1. ✅ Use clear and direct instructions
2. ✅ Organize instructions hierarchically using Markdown
3. ✅ Specify the required response length
4. ✅ Add examples when needed
5. ✅ Test and adjust as needed

---

## 🚀 النظام المتقدم جداً (Ultra Enhanced)
## Ultra Enhanced System

تم إضافة نظام متقدم جداً مع جميع الميزات المتقدمة:

An ultra enhanced system has been added with all advanced features:

### الميزات الرئيسية / Key Features:
- ✅ **الإطار المعرفي المتقدم** - مستويات اليقين والاستدلال البايزي
- ✅ **منهجية البحث المتقدمة** - 5-7 استعلامات بحث مستهدفة
- ✅ **بنية الاستشهاد المتقدمة** - [type:number:year] مع أنواع متعددة
- ✅ **البنية المعرفية متعددة اللغات** - تكيف مع العربية والإنجليزية والألمانية والإسبانية
- ✅ **تصور سلسلة الاستدلال** - تحليل المشكلة والاستدلال
- ✅ **بروتوكولات منع الهلوسة** - منع المعلومات المصنوعة
- ✅ **بوابات جودة المخرجات** - فحص شامل قبل الإرسال
- ✅ **بروتوكول ذاكرة السياق** - الحفاظ على السياق عبر الأدوار

- ✅ **Advanced Epistemic Framework** - Certainty levels and Bayesian reasoning
- ✅ **Advanced Research Methodology** - 5-7 targeted search queries
- ✅ **Advanced Citation Architecture** - [type:number:year] with multiple types
- ✅ **Multilingual Cognitive Architecture** - Adaptation for Arabic, English, German, Spanish
- ✅ **Reasoning Chain Visualization** - Problem decomposition and reasoning
- ✅ **Hallucination Prevention Protocols** - Prevent fabricated information
- ✅ **Output Quality Gates** - Comprehensive checks before sending
- ✅ **Context Memory Protocol** - Maintain context across turns

### الاستخدام / Usage:

```typescript
// الطريقة 1: مع getSystemPrompt
const prompt = getSystemPrompt(
  false, // isVoiceMode
  true,  // deepThinking
  'ar',  // language
  'general', // focusMode
  true,  // useAdvancedBuilder
  false, // useMultilingualAdvanced
  true   // useUltraEnhanced ← النظام المتقدم جداً
)

// الطريقة 2: دالة مخصصة
import { getUltraEnhancedSystemPrompt } from '@/lib/ai-training-prompt'
const prompt = getUltraEnhancedSystemPrompt('bilingual')

// الطريقة 3: مباشرة
import { getUltraEnhancedPrompt } from '@/lib/ultra-enhanced-system-prompt'
const prompt = getUltraEnhancedPrompt('ar')
```

### ملفات النظام المتقدم / Ultra Enhanced Files:
- `lib/ultra-enhanced-system-prompt.ts` - النظام المتقدم مع جميع الأجزاء الستة
- `lib/ultra-enhanced-training-system.py` - نظام التدريب Python

### الأجزاء الستة / Six Parts:
1. **PART 1**: Ultra Enhanced System Prompt - النظام الأساسي
2. **PART 2**: Training Data Structure - هيكل بيانات التدريب
3. **PART 3**: Quality Assurance Rubric - معايير ضمان الجودة
4. **PART 4**: Python Implementation - تنفيذ Python
5. **PART 5**: Fine-Tuning Configuration - تكوين Fine-Tuning
6. **PART 6**: Continuous Improvement Loop - حلقة التحسين المستمر

**تم الدمج بنجاح! ✅ / Integration Complete! ✅**

