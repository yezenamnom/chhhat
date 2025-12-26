"use client"

import { FileCode, Database, Bug, Rocket, Palette, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CodeTemplate {
  id: string
  title: string
  description: string
  prompt: string
  icon: React.ReactNode
  category: "web" | "data" | "bug" | "feature" | "design"
}

const CODE_TEMPLATES: CodeTemplate[] = [
  {
    id: "todo-app",
    title: "تطبيق Todo List",
    description: "تطبيق قائمة مهام كامل مع Next.js و Tailwind",
    prompt: "أنشئ لي تطبيق todo list كامل مع Next.js و Tailwind CSS. يجب أن يحتوي على: إضافة مهام، حذف مهام، تحديث حالة المهمة (مكتملة/غير مكتملة)، حفظ البيانات في localStorage، تصميم جميل وحديث.",
    icon: <FileCode className="w-4 h-4" />,
    category: "web",
  },
  {
    id: "dashboard",
    title: "لوحة تحكم",
    description: "لوحة تحكم احترافية مع إحصائيات ورسوم بيانية",
    prompt: "أنشئ لي لوحة تحكم احترافية مع Next.js و Tailwind CSS. يجب أن تحتوي على: إحصائيات رئيسية (بطاقات)، رسوم بيانية تفاعلية، جدول بيانات، قائمة جانبية، تصميم احترافي وحديث.",
    icon: <Database className="w-4 h-4" />,
    category: "web",
  },
  {
    id: "data-analysis",
    title: "تحليل البيانات",
    description: "أداة لتحليل البيانات وعرض الإحصائيات",
    prompt: "أنشئ لي أداة لتحليل البيانات مع Next.js. يجب أن تحتوي على: رفع ملف CSV/JSON، تحليل البيانات، عرض إحصائيات (متوسط، مجموع، أعلى، أدنى)، رسوم بيانية تفاعلية، تصدير النتائج.",
    icon: <Database className="w-4 h-4" />,
    category: "data",
  },
  {
    id: "bug-fix",
    title: "إصلاح خطأ",
    description: "مساعدة في إصلاح أخطاء الكود",
    prompt: "ساعدني في إصلاح هذا الخطأ في الكود. [اكتب الخطأ هنا]",
    icon: <Bug className="w-4 h-4" />,
    category: "bug",
  },
  {
    id: "api-integration",
    title: "تكامل API",
    description: "تكامل مع API خارجي وعرض البيانات",
    prompt: "أنشئ لي صفحة تكامل مع API. يجب أن تحتوي على: جلب البيانات من API، عرض البيانات في جدول/قائمة، معالجة الأخطاء، حالة التحميل، تحديث البيانات.",
    icon: <Globe className="w-4 h-4" />,
    category: "web",
  },
  {
    id: "form-builder",
    title: "نموذج ديناميكي",
    description: "نموذج ديناميكي مع التحقق من البيانات",
    prompt: "أنشئ لي نموذج ديناميكي مع Next.js. يجب أن يحتوي على: حقول متعددة (نص، بريد إلكتروني، رقم، تاريخ)، التحقق من البيانات، رسائل خطأ واضحة، تصميم جميل، إرسال البيانات.",
    icon: <FileCode className="w-4 h-4" />,
    category: "web",
  },
  {
    id: "ui-component",
    title: "مكون UI",
    description: "مكون واجهة مستخدم قابل لإعادة الاستخدام",
    prompt: "أنشئ لي مكون UI قابل لإعادة الاستخدام مع React و TypeScript و Tailwind CSS. يجب أن يكون: قابل للتخصيص، متجاوب، سهل الاستخدام، مع توثيق كامل.",
    icon: <Palette className="w-4 h-4" />,
    category: "design",
  },
  {
    id: "feature-request",
    title: "ميزة جديدة",
    description: "إضافة ميزة جديدة للتطبيق",
    prompt: "أريد إضافة ميزة جديدة للتطبيق. [اكتب الميزة المطلوبة هنا]",
    icon: <Rocket className="w-4 h-4" />,
    category: "feature",
  },
]

interface CodeTemplatesProps {
  onSelectTemplate: (prompt: string) => void
}

export default function CodeTemplates({ onSelectTemplate }: CodeTemplatesProps) {
  const categories = ["web", "data", "bug", "feature", "design"] as const
  const categoryLabels: Record<string, string> = {
    web: "تطبيقات ويب",
    data: "تحليل البيانات",
    bug: "إصلاح أخطاء",
    feature: "ميزات جديدة",
    design: "مكونات UI",
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Rocket className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-white">قوالب جاهزة</h3>
      </div>

      {categories.map((category) => {
        const templates = CODE_TEMPLATES.filter((t) => t.category === category)
        if (templates.length === 0) return null

        return (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-400">{categoryLabels[category]}</h4>
            <div className="grid grid-cols-1 gap-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="w-full justify-start text-right h-auto py-3 px-4 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700"
                  onClick={() => onSelectTemplate(template.prompt)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="mt-0.5 text-blue-500">{template.icon}</div>
                    <div className="flex-1 text-right">
                      <div className="font-medium text-white mb-1">{template.title}</div>
                      <div className="text-xs text-zinc-400">{template.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

