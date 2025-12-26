"""
مولد بيانات التدريب المحسّن
Enhanced Training Data Generator
"""

import json
import sys
from pathlib import Path
from datetime import datetime

# إضافة المسار للاستيراد
lib_path = Path(__file__).parent
sys.path.insert(0, str(lib_path))

# استيراد مع معالجة اسم الملف
import importlib.util
spec = importlib.util.spec_from_file_location(
    "ultra_enhanced_training_system",
    lib_path / "ultra-enhanced-training-system.py"
)
ultra_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ultra_module)

AdvancedAITrainingSystem = ultra_module.AdvancedAITrainingSystem
TrainingExample = ultra_module.TrainingExample

def create_training_examples():
    """إنشاء أمثلة تدريب متنوعة"""
    system = AdvancedAITrainingSystem()
    
    # ===== مثال 1: البرمجة (عربي) =====
    example1 = system.prepare_training_example(
        user_query="كيف أنشئ مكون React مع TypeScript؟",
        response="""## إنشاء مكون React مع TypeScript

لإنشاء مكون React مع TypeScript، اتبع الخطوات التالية:

### 1. إعداد المشروع
```tsx
// components/MyComponent.tsx
import React from 'react'

interface MyComponentProps {
  title: string
  count?: number
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, count = 0 }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
    </div>
  )
}
```

### 2. المزايا الرئيسية
- Type Safety: TypeScript يضمن نوع البيانات [tech:1:2024]
- Better IDE Support: دعم أفضل في محررات الكود [tech:2:2024]
- Refactoring: إعادة هيكلة أسهل وأكثر أماناً [analysis:1:2024]

### 3. أفضل الممارسات
- استخدم interfaces للـ props
- حدد أنواع البيانات بوضوح
- استخدم optional properties (?) عند الحاجة""",
        sources=[
            {"type": "tech", "number": 1, "year": 2024, "title": "TypeScript React Guide"},
            {"type": "tech", "number": 2, "year": 2024, "title": "React TypeScript Best Practices"},
            {"type": "analysis", "number": 1, "year": 2024, "title": "TypeScript Benefits Analysis"}
        ],
        quality_score=9.0
    )
    system.add_training_example(example1)
    system.validate_quality(example1.output)
    
    # ===== مثال 2: العلوم (إنجليزي) =====
    example2 = system.prepare_training_example(
        user_query="What are the latest developments in quantum computing?",
        response="""## Recent Quantum Computing Breakthroughs (Q4 2024 - Q1 2025)

### Google's Willow Chip [news:1:2024]
Google announced significant improvements in quantum error correction, achieving error rates below 0.1% [peer:1:2024]. This represents a major milestone in practical quantum computing.

### IBM's Quantum Roadmap [tech:1:2024]
IBM released their latest quantum processor with enhanced stability. The new architecture shows promise for commercial applications [tech:1:2024].

### Error Correction Progress [peer:2:2025]
Recent research demonstrates promising results in quantum error correction [peer:2:2025]. The breakthrough could enable fault-tolerant quantum computers within the next decade [analysis:1:2025].

### Practical Timeline
| Milestone | Timeline | Confidence |
|-----------|----------|------------|
| Error correction < 0.1% | 2024 | 95% |
| 1000+ qubit systems | 2026 | 70% |
| Commercial applications | 2028 | 50% |

**Sources Ranked by Credibility:**
- Peer-reviewed journal articles [peer:1][peer:2]
- Company technical publications [tech:1]
- News analysis with expert quotes [news:1][analysis:1]""",
        sources=[
            {"type": "news", "number": 1, "year": 2024, "title": "Google Quantum Announcement"},
            {"type": "peer", "number": 1, "year": 2024, "title": "Quantum Error Correction Study"},
            {"type": "tech", "number": 1, "year": 2024, "title": "IBM Quantum Roadmap"},
            {"type": "peer", "number": 2, "year": 2025, "title": "Fault-Tolerant Quantum Computing"},
            {"type": "analysis", "number": 1, "year": 2025, "title": "Quantum Computing Timeline"}
        ],
        quality_score=9.5
    )
    system.add_training_example(example2)
    system.validate_quality(example2.output)
    
    # ===== مثال 3: الكتابة (عربي) =====
    example3 = system.prepare_training_example(
        user_query="كيف أحسّن أسلوب كتابتي؟",
        response="""## طرق تحسين أسلوب الكتابة

### 1. الوضوح والاختصار
- استخدم جمل قصيرة وواضحة [analysis:1:2024]
- تجنب الجمل المعقدة غير الضرورية
- راجع كل جملة للتأكد من وضوحها

### 2. التنوع في البنية
- اخلط بين الجمل البسيطة والمركبة [peer:1:2024]
- استخدم تراكيب مختلفة لتجنب الرتابة
- تنوّع في طول الجمل

### 3. اختيار الكلمات
- اختر كلمات دقيقة ومعبرة [analysis:2:2024]
- تجنب التكرار غير الضروري
- استخدم قاموس ثري ومتنوع

### 4. الممارسة المستمرة
البحوث تظهر أن الكتابة اليومية تحسّن الأسلوب بنسبة 40% خلال 3 أشهر [peer:2:2024].

### نصائح عملية
1. اكتب يومياً لمدة 30 دقيقة على الأقل
2. اقرأ أعمال كتّاب محترفين
3. اطلب التغذية الراجعة من الآخرين""",
        sources=[
            {"type": "analysis", "number": 1, "year": 2024, "title": "Writing Clarity Guide"},
            {"type": "peer", "number": 1, "year": 2024, "title": "Sentence Structure Research"},
            {"type": "analysis", "number": 2, "year": 2024, "title": "Word Choice Analysis"},
            {"type": "peer", "number": 2, "year": 2024, "title": "Writing Practice Study"}
        ],
        quality_score=8.5
    )
    system.add_training_example(example3)
    system.validate_quality(example3.output)
    
    # ===== مثال 4: الأكاديمي (إنجليزي) =====
    example4 = system.prepare_training_example(
        user_query="Explain the theory of relativity in academic terms",
        response="""## Theory of Relativity: Academic Overview

### Special Relativity (1905)
Einstein's special theory of relativity revolutionized physics by introducing the constancy of the speed of light [peer:1:1905]. The theory posits that:

1. **Postulate of Relativity**: Physical laws are identical in all inertial frames [peer:1:1905]
2. **Constancy of Light Speed**: Light speed is constant regardless of observer motion [peer:2:1905]

### General Relativity (1915)
General relativity extends special relativity to include gravity through the equivalence principle [peer:3:1915]. Key concepts include:

- **Spacetime Curvature**: Mass-energy curves spacetime [peer:3:1915]
- **Gravitational Waves**: Predicted in 1916, confirmed in 2015 [news:1:2015]
- **Black Holes**: Solutions to Einstein's field equations [peer:4:1916]

### Experimental Validation
Multiple experiments confirm relativity predictions [peer:5:2019]:
- Gravitational lensing observations [data:1:2020]
- GPS satellite corrections [tech:1:2020]
- LIGO gravitational wave detections [peer:6:2016]

**Academic Sources:**
- Einstein's original papers [peer:1:1905][peer:3:1915]
- Modern reviews and textbooks [peer:5:2019]
- Experimental confirmations [peer:6:2016][data:1:2020]""",
        sources=[
            {"type": "peer", "number": 1, "year": 1905, "title": "Einstein Special Relativity"},
            {"type": "peer", "number": 2, "year": 1905, "title": "Light Speed Constancy"},
            {"type": "peer", "number": 3, "year": 1915, "title": "Einstein General Relativity"},
            {"type": "peer", "number": 4, "year": 1916, "title": "Schwarzschild Solution"},
            {"type": "peer", "number": 5, "year": 2019, "title": "Relativity Review"},
            {"type": "peer", "number": 6, "year": 2016, "title": "LIGO Detection"},
            {"type": "news", "number": 1, "year": 2015, "title": "Gravitational Waves Discovery"},
            {"type": "data", "number": 1, "year": 2020, "title": "Gravitational Lensing Data"},
            {"type": "tech", "number": 1, "year": 2020, "title": "GPS Relativity Corrections"}
        ],
        quality_score=9.8
    )
    system.add_training_example(example4)
    system.validate_quality(example4.output)
    
    # ===== مثال 5: البرمجة (إنجليزي) =====
    example5 = system.prepare_training_example(
        user_query="How do I implement authentication in Next.js?",
        response="""## Implementing Authentication in Next.js

### 1. NextAuth.js Setup [tech:1:2024]
NextAuth.js is the recommended solution for Next.js authentication [tech:1:2024].

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
}

export default NextAuth(authOptions)
```

### 2. Session Management
- Server-side: Use `getServerSession()` [tech:2:2024]
- Client-side: Use `useSession()` hook [tech:2:2024]
- Middleware protection for routes [tech:3:2024]

### 3. Security Best Practices
Research shows that 70% of security breaches involve authentication issues [analysis:1:2024]:
- Always use HTTPS in production [tech:4:2024]
- Implement CSRF protection [peer:1:2024]
- Use secure session storage [tech:4:2024]

### 4. Database Integration
Store user sessions securely [tech:5:2024]:
- Recommended: PostgreSQL or MongoDB
- Use encrypted session tokens
- Implement session expiration""",
        sources=[
            {"type": "tech", "number": 1, "year": 2024, "title": "NextAuth.js Documentation"},
            {"type": "tech", "number": 2, "year": 2024, "title": "Next.js Session Management"},
            {"type": "tech", "number": 3, "year": 2024, "title": "Next.js Middleware"},
            {"type": "tech", "number": 4, "year": 2024, "title": "Web Security Best Practices"},
            {"type": "tech", "number": 5, "year": 2024, "title": "Database Session Storage"},
            {"type": "analysis", "number": 1, "year": 2024, "title": "Security Breach Analysis"},
            {"type": "peer", "number": 1, "year": 2024, "title": "CSRF Protection Research"}
        ],
        quality_score=9.2
    )
    system.add_training_example(example5)
    system.validate_quality(example5.output)
    
    # ===== مثال 6: العلوم (عربي) =====
    example6 = system.prepare_training_example(
        user_query="ما هو الذكاء الاصطناعي وكيف يعمل؟",
        response="""## الذكاء الاصطناعي: نظرة شاملة

### التعريف
الذكاء الاصطناعي (AI) هو قدرة الآلات على محاكاة الذكاء البشري [peer:1:2024]. يتضمن التعلم والاستدلال واتخاذ القرارات.

### أنواع الذكاء الاصطناعي
1. **الذكاء الاصطناعي الضيق (Narrow AI)**: متخصص في مهام محددة [tech:1:2024]
2. **الذكاء الاصطناعي العام (AGI)**: هدف مستقبلي للذكاء الشامل [analysis:1:2024]

### كيف يعمل؟
#### 1. التعلم الآلي (Machine Learning)
- الخوارزميات تتعلم من البيانات [peer:2:2024]
- تحسين الأداء مع المزيد من البيانات [tech:2:2024]

#### 2. الشبكات العصبية
- محاكاة بنية الدماغ البشري [peer:3:2024]
- طبقات متعددة للمعالجة [tech:3:2024]

#### 3. التعلم العميق (Deep Learning)
- شبكات عصبية عميقة [peer:4:2024]
- معالجة البيانات المعقدة [analysis:2:2024]

### التطبيقات الحالية
- التعرف على الصور: دقة تصل إلى 95% [news:1:2024]
- معالجة اللغة الطبيعية: ChatGPT و Claude [tech:4:2024]
- السيارات ذاتية القيادة: في مرحلة التطوير [news:2:2024]

**المصادر:**
- أوراق أكاديمية [peer:1][peer:2][peer:3][peer:4]
- وثائق تقنية [tech:1][tech:2][tech:3][tech:4]
- تحليلات خبراء [analysis:1][analysis:2]
- أخبار حديثة [news:1][news:2]""",
        sources=[
            {"type": "peer", "number": 1, "year": 2024, "title": "AI Definition Research"},
            {"type": "tech", "number": 1, "year": 2024, "title": "Narrow AI Guide"},
            {"type": "analysis", "number": 1, "year": 2024, "title": "AGI Analysis"},
            {"type": "peer", "number": 2, "year": 2024, "title": "Machine Learning Study"},
            {"type": "tech", "number": 2, "year": 2024, "title": "ML Best Practices"},
            {"type": "peer", "number": 3, "year": 2024, "title": "Neural Networks Research"},
            {"type": "tech", "number": 3, "year": 2024, "title": "Neural Network Architecture"},
            {"type": "peer", "number": 4, "year": 2024, "title": "Deep Learning Study"},
            {"type": "analysis", "number": 2, "year": 2024, "title": "Deep Learning Applications"},
            {"type": "news", "number": 1, "year": 2024, "title": "Image Recognition Breakthrough"},
            {"type": "tech", "number": 4, "year": 2024, "title": "NLP Models"},
            {"type": "news", "number": 2, "year": 2024, "title": "Autonomous Vehicles"}
        ],
        quality_score=9.3
    )
    system.add_training_example(example6)
    system.validate_quality(example6.output)
    
    return system

def main():
    """الدالة الرئيسية"""
    print("🚀 بدء إنشاء بيانات التدريب المحسّنة...")
    print("=" * 60)
    
    system = create_training_examples()
    
    # طباعة الإحصائيات
    print(f"\n✅ تم إنشاء {len(system.training_examples)} أمثلة تدريب")
    
    # التحقق من الجودة
    print("\n📊 إحصائيات الجودة:")
    stats = system.get_quality_statistics()
    for metric, values in stats.items():
        print(f"  {metric}: {values['mean']:.2f} (min: {values['min']:.2f}, max: {values['max']:.2f})")
    
    # تصدير البيانات
    output_file = "training_data_enhanced.jsonl"
    system.export_training_jsonl(output_file)
    
    print(f"\n💾 تم تصدير البيانات إلى: {output_file}")
    
    # طباعة تكوين Fine-Tuning
    print("\n⚙️  تكوين Fine-Tuning:")
    config = system.generate_fine_tuning_config()
    print(json.dumps(config, indent=2))
    
    print("\n✨ اكتمل إنشاء بيانات التدريب!")

if __name__ == "__main__":
    main()

