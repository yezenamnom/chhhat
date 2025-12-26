import { buildSystemPrompt, type SystemPromptConfig } from './system-prompt-builder'
import { ADVANCED_MULTILINGUAL_PROMPT, ADVANCED_MULTILINGUAL_PROMPT_AR } from './system-prompt-examples'
import { getUltraEnhancedPrompt } from './ultra-enhanced-system-prompt'
import { getSystemPromptEnhanced as getEnhancedPrompt } from './enhanced-ai-training-prompt'

const BASE_SYSTEM_PROMPT_AR = "Your Arabic base system prompt here"
const BASE_SYSTEM_PROMPT_EN = "Your English base system prompt here"

/**
 * إنشاء System Prompt باستخدام النظام الجديد (Prompt Engineering)
 * Create System Prompt using the new system (Prompt Engineering)
 */
function buildAdvancedSystemPrompt(
  isVoiceMode: boolean,
  deepThinking: boolean,
  language: string,
  focusMode: "general" | "academic" | "writing" | "code" = "general",
): string {
  const lang = language === "ar" ? "ar" : language === "en" ? "en" : "bilingual"
  
  // تحديد السياق حسب الوضع
  let context = ""
  let task: string[] = []
  let tone: "formal" | "friendly" | "professional" | "casual" = "professional"
  let style: "direct" | "detailed" | "concise" = isVoiceMode ? "concise" : "detailed"

  if (isVoiceMode) {
    context = lang === "ar"
      ? "أنت مساعد ذكي محترف ومحاور ممتاز. المستخدم يتحدث معك صوتياً."
      : lang === "en"
      ? "You are a professional AI assistant and excellent conversationalist. The user is speaking to you via voice."
      : "أنت مساعد ذكي محترف ومحاور ممتاز. المستخدم يتحدث معك صوتياً. / You are a professional AI assistant and excellent conversationalist. The user is speaking to you via voice."
    
    task = lang === "ar"
      ? [
          "الرد على التحيات بشكل مختصر وودود",
          "استخدام لغة محادثاتية بسيطة بدون تنسيق معقد",
          "تقديم إجابات مباشرة ومختصرة",
        ]
      : lang === "en"
      ? [
          "Respond to greetings briefly and friendly",
          "Use simple conversational language without complex formatting",
          "Provide direct and concise answers",
        ]
      : [
          "الرد على التحيات بشكل مختصر وودود / Respond to greetings briefly and friendly",
          "استخدام لغة محادثاتية بسيطة / Use simple conversational language",
          "تقديم إجابات مباشرة ومختصرة / Provide direct and concise answers",
        ]
    
    tone = "friendly"
    style = "concise"
  } else {
    context = lang === "ar"
      ? "أنت مساعد ذكي متقدم ومحترف. تجيب على جميع الأسئلة بذكاء ودقة في أي مجال."
      : lang === "en"
      ? "You are an advanced and professional AI assistant. You answer all questions intelligently and accurately in any field."
      : "أنت مساعد ذكي متقدم ومحترف. / You are an advanced and professional AI assistant."
    
    task = lang === "ar"
      ? [
          "الإجابة على الأسئلة في جميع المجالات بدقة",
          "استخدام تنسيق واضح ومنظم (عناوين، قوائم، أكواد)",
          "تقديم أمثلة عند الحاجة",
          "تجنب البحث على الإنترنت للأسئلة البسيطة",
        ]
      : lang === "en"
      ? [
          "Answer questions in all fields accurately",
          "Use clear and organized formatting (headings, lists, code blocks)",
          "Provide examples when needed",
          "Avoid searching the web for simple questions",
        ]
      : [
          "الإجابة على الأسئلة بدقة / Answer questions accurately",
          "استخدام تنسيق واضح / Use clear formatting",
          "تقديم أمثلة عند الحاجة / Provide examples when needed",
        ]
  }

  // إضافة تعليمات Focus Mode
  if (focusMode === "academic") {
    task.push(
      lang === "ar" ? "استخدام لغة أكاديمية رسمية ومنهجية"
      : lang === "en" ? "Use formal, scholarly language and methodology"
      : "استخدام لغة أكاديمية رسمية / Use formal, scholarly language"
    )
    tone = "formal"
  } else if (focusMode === "writing") {
    task.push(
      lang === "ar" ? "التركيز على جودة الكتابة والأسلوب"
      : lang === "en" ? "Focus on writing quality and style"
      : "التركيز على جودة الكتابة / Focus on writing quality"
    )
  } else if (focusMode === "code") {
    task.push(
      lang === "ar" ? "تقديم حلول برمجية عملية وأكواد نظيفة"
      : lang === "en" ? "Provide practical programming solutions and clean code"
      : "تقديم حلول برمجية / Provide programming solutions"
    )
  }

  // إضافة تعليمات Deep Thinking
  if (deepThinking) {
    task.push(
      lang === "ar" ? "تحليل السؤال بعمق قبل الإجابة"
      : lang === "en" ? "Analyze the question deeply before answering"
      : "تحليل السؤال بعمق / Analyze the question deeply"
    )
    style = "detailed"
  }

  const config: SystemPromptConfig = {
    context,
    task,
    format: {
      structure: isVoiceMode
        ? (lang === "ar"
            ? ["رد مختصر", "لغة محادثاتية"]
            : lang === "en"
            ? ["Brief response", "Conversational language"]
            : ["رد مختصر / Brief response", "لغة محادثاتية / Conversational language"])
        : (lang === "ar"
            ? ["عنوان رئيسي", "شرح منظم", "أمثلة عند الحاجة"]
            : lang === "en"
            ? ["Main heading", "Organized explanation", "Examples when needed"]
            : ["عنوان رئيسي / Main heading", "شرح منظم / Organized explanation", "أمثلة / Examples"]),
      useMarkdown: !isVoiceMode,
      codeBlocks: focusMode === "code",
    },
    tone,
    style,
    additionalRules: isVoiceMode
      ? (lang === "ar"
          ? [
              "لا تبحث عن معنى الكلمات البسيطة أو التحيات",
              "استخدم لغة بسيطة بدون تنسيق معقد",
            ]
          : lang === "en"
          ? [
              "Don't search for meanings of simple words or greetings",
              "Use simple language without complex formatting",
            ]
          : [
              "لا تبحث عن معنى الكلمات البسيطة / Don't search for simple words",
              "استخدم لغة بسيطة / Use simple language",
            ])
      : (lang === "ar"
          ? [
              "لا تبحث على الإنترنت للأسئلة البسيطة أو التحيات",
              "استخدم البحث العميق فقط للمواضيع التي تحتاج معلومات محدثة",
            ]
          : lang === "en"
          ? [
              "Don't search the web for simple questions or greetings",
              "Use deep search only for topics needing updated information",
            ]
          : [
              "لا تبحث للأسئلة البسيطة / Don't search for simple questions",
              "استخدم البحث العميق عند الحاجة / Use deep search when needed",
            ]),
    language: lang,
    responseLength: isVoiceMode ? "short" : deepThinking ? "long" : "medium",
  }

  return buildSystemPrompt(config)
}

/**
 * الدالة الأصلية - محافظة على التوافق مع الكود الموجود
 * Original function - maintains compatibility with existing code
 */
export function getSystemPrompt(
  isVoiceMode: boolean,
  deepThinking: boolean,
  language: string,
  focusMode: "general" | "academic" | "writing" | "code" = "general",
  useAdvancedBuilder: boolean = true, // استخدام النظام الجديد افتراضياً
  useMultilingualAdvanced: boolean = false, // استخدام النظام المتقدم متعدد اللغات
  useUltraEnhanced: boolean = false, // استخدام النظام المتقدم جداً (Ultra Enhanced)
  useEnhancedTraining: boolean = true, // ⭐ جديد: استخدام النظام المحسّن من مواد التدريب
): string {
  // ⭐ استخدام النظام المحسّن من مواد التدريب (افتراضي)
  if (useEnhancedTraining) {
    return getEnhancedPrompt(isVoiceMode, deepThinking, language, focusMode)
  }
  
  // استخدام النظام المتقدم جداً إذا كان مفعّل
  if (useUltraEnhanced) {
    if (isVoiceMode) {
      // للوضع الصوتي، استخدم النظام العادي (أقصر)
      return buildAdvancedSystemPrompt(isVoiceMode, deepThinking, language, focusMode)
    }
    // للوضع النصي، استخدم النظام المتقدم جداً
    const lang = language === "ar" ? "ar" : language === "en" ? "en" : "bilingual"
    return getUltraEnhancedPrompt(lang)
  }
  
  // استخدام النظام المتقدم متعدد اللغات إذا كان مفعّل
  if (useMultilingualAdvanced) {
    if (isVoiceMode) {
      // للوضع الصوتي، استخدم النظام العادي (أقصر)
      return buildAdvancedSystemPrompt(isVoiceMode, deepThinking, language, focusMode)
    }
    // للوضع النصي، استخدم النظام المتقدم متعدد اللغات
    if (language === "ar" || language === "en") {
      return ADVANCED_MULTILINGUAL_PROMPT_AR
    }
    return ADVANCED_MULTILINGUAL_PROMPT
  }
  
  // استخدام النظام الجديد إذا كان مفعّل
  if (useAdvancedBuilder) {
    return buildAdvancedSystemPrompt(isVoiceMode, deepThinking, language, focusMode)
  }

  // النظام القديم (للتوافق) - فقط إذا كان useAdvancedBuilder = false
  if (isVoiceMode) {
    if (language === "ar") {
      return `أنت مساعد ذكي محترف ومحاور ممتاز. المستخدم يتحدث معك صوتياً.

**قواعد المحادثة الصوتية:**
- عند التحية، رد بتحية مختصرة وأسأل كيف يمكنك المساعدة
- مثال: "مرحباً" → "أهلاً! كيف يمكنني مساعدتك؟"
- مثال: "السلام عليكم" → "وعليكم السلام! تفضل"
- أجب بشكل طبيعي ومباشر بدون بحث على الإنترنت للتحيات البسيطة
- لا تبحث عن معنى الكلمات البسيطة أو التحيات
- استخدم لغة محادثاتية بسيطة بدون تنسيق أو قوائم
- كن مختصراً ومباشراً في الإجابات الصوتية

أنت مساعد ذكي متعدد المجالات تتقن:
- **البرمجة**: جميع اللغات والأطر والتقنيات
- **العلوم**: الفيزياء، الكيمياء، البيولوجيا، الفلك
- **الرياضيات**: الجبر، الهندسة، التفاضل والتكامل، الإحصاء
- **اللغات**: العربية والإنجليزية وقواعدهما
- **التاريخ والجغرافيا**: أحداث عالمية وثقافات
- **الفنون**: الأدب، الموسيقى، التصميم
- **الأعمال**: إدارة، تسويق، اقتصاد
- **أي موضوع آخر**: ثقافة عامة واستشارات

**التذكر: المستخدم يستخدم الصوت، اجعل إجاباتك سهلة الاستماع.**`
    } else {
      return `You are a professional AI assistant and excellent conversationalist. The user is speaking to you via voice.

**Voice Conversation Rules:**
- When greeted, reply with a brief greeting and ask how you can help
- Example: "hello" → "Hi! How can I help you?"
- Example: "hi there" → "Hello! What can I do for you?"
- Answer naturally and directly without searching the web for simple greetings
- Don't search for meanings of simple words or greetings
- Use simple conversational language without formatting or lists
- Be concise and direct in voice responses

You are a versatile AI assistant proficient in:
- **Programming**: All languages, frameworks, and technologies
- **Science**: Physics, Chemistry, Biology, Astronomy
- **Mathematics**: Algebra, Geometry, Calculus, Statistics
- **Languages**: English and Arabic with grammar expertise
- **History & Geography**: Global events and cultures
- **Arts**: Literature, Music, Design
- **Business**: Management, Marketing, Economics
- **Any other topic**: General knowledge and consulting

**Remember: The user is using voice, keep your responses easy to listen to.**`
    }
  }

  // للوضع النصي العادي
  let basePrompt: string
  if (language === "ar") {
    basePrompt = `أنت مساعد ذكي متقدم ومحترف. تجيب على جميع الأسئلة بذكاء ودقة في أي مجال.

أنت خبير في:
- البرمجة وتطوير البرمجيات بجميع اللغات
- العلوم (فيزياء، كيمياء، بيولوجيا، فلك)
- الرياضيات بجميع فروعها
- اللغات والأدب والثقافة
- التاريخ والجغرافيا
- الأعمال والاقتصاد والتسويق
- أي موضوع آخر يطرحه المستخدم

**قواعد الإجابة:**
- لا تبحث على الإنترنت للأسئلة البسيطة أو التحيات
- استخدم البحث العميق فقط للمواضيع التي تحتاج معلومات محدثة
- أجب بشكل واضح ومنظم مع أمثلة عند الحاجة
- استخدم التنسيق المناسب (عناوين، قوائم، أكواد)
- كن دقيقاً ومفيداً في جميع إجاباتك`
  } else {
    basePrompt = `You are an advanced and professional AI assistant. You answer all questions intelligently and accurately in any field.

You are an expert in:
- Programming and software development in all languages
- Science (Physics, Chemistry, Biology, Astronomy)
- Mathematics in all branches
- Languages, Literature, and Culture
- History and Geography
- Business, Economics, and Marketing
- Any other topic the user asks about

**Response Rules:**
- Don't search the web for simple questions or greetings
- Use deep search only for topics needing updated information
- Answer clearly and organized with examples when needed
- Use appropriate formatting (headings, lists, code blocks)
- Be accurate and helpful in all your responses`
  }

  // Focus Mode adjustments
  let focusPrompt = ""
  if (focusMode === "academic") {
    if (language === "ar") {
      focusPrompt = `

**وضع أكاديمي:**
- استخدم لغة أكاديمية رسمية ومنهجية
- قدم معلومات دقيقة مع الإشارة إلى المصادر
- استخدم مصطلحات علمية دقيقة
- قدم تحليلاً عميقاً ومنطقياً
- أضف مراجع واقتباسات عند الحاجة`
    } else {
      focusPrompt = `

**Academic Mode:**
- Use formal, scholarly language and methodology
- Provide accurate information with source citations
- Use precise scientific terminology
- Offer deep, logical analysis
- Include references and citations when appropriate`
    }
  } else if (focusMode === "writing") {
    if (language === "ar") {
      focusPrompt = `

**وضع الكتابة:**
- ركز على الجودة الأدبية والأناقة في التعبير
- استخدم لغة واضحة وجذابة
- قدم نصائح لتحسين الكتابة
- راجع القواعد النحوية والإملائية
- اقترح تحسينات على الأسلوب`
    } else {
      focusPrompt = `

**Writing Mode:**
- Focus on literary quality and elegant expression
- Use clear and engaging language
- Provide writing improvement tips
- Review grammar and spelling
- Suggest style improvements`
    }
  } else if (focusMode === "code") {
    if (language === "ar") {
      focusPrompt = `

**وضع البرمجة:**
- ركز على الحلول البرمجية العملية
- قدم أكواد نظيفة وموثقة
- اشرح المفاهيم البرمجية بوضوح
- قدم أمثلة عملية قابلة للتطبيق
- اقترح أفضل الممارسات (best practices)`
    } else {
      focusPrompt = `

**Code Mode:**
- Focus on practical programming solutions
- Provide clean, documented code
- Explain programming concepts clearly
- Offer practical, applicable examples
- Suggest best practices`
    }
  }

  if (deepThinking) {
    const deepThinkingText = `

**التفكير العميق مفعّل:**
- حلل السؤال بعمق قبل الإجابة
- فكر في جميع الجوانب والاحتمالات
- قدم إجابة شاملة ومدروسة
- اشرح المنطق وراء استنتاجاتك`
    const deepThinkingPrompt = basePrompt + focusPrompt + deepThinkingText
    return deepThinkingPrompt
  }

  const finalPrompt = basePrompt + focusPrompt
  return finalPrompt
}

/**
 * الحصول على System Prompt متقدم متعدد اللغات
 * Get Advanced Multilingual System Prompt
 */
export function getAdvancedMultilingualPrompt(
  language: "ar" | "en" | "bilingual" = "bilingual"
): string {
  if (language === "ar") {
    return ADVANCED_MULTILINGUAL_PROMPT_AR
  } else if (language === "en") {
    return ADVANCED_MULTILINGUAL_PROMPT
  }
  return ADVANCED_MULTILINGUAL_PROMPT_AR
}

/**
 * الحصول على System Prompt المتقدم جداً (Ultra Enhanced)
 * Get Ultra Enhanced System Prompt
 */
export function getUltraEnhancedSystemPrompt(
  language: "ar" | "en" | "bilingual" = "bilingual"
): string {
  return getUltraEnhancedPrompt(language)
}
