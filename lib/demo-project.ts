// Demo project files for testing
export const DEMO_PROJECT_FILES = [
  {
    name: "app/page.tsx",
    content: '"use client"\n\n' +
      'import { useState } from "react"\n' +
      'import { Plus, Trash2, Check } from "lucide-react"\n\n' +
      'interface Todo {\n' +
      '  id: string\n' +
      '  text: string\n' +
      '  completed: boolean\n' +
      '}\n\n' +
      'export default function TodoApp() {\n' +
      '  const [todos, setTodos] = useState<Todo[]>([])\n' +
      '  const [input, setInput] = useState("")\n\n' +
      '  const addTodo = () => {\n' +
      '    if (input.trim()) {\n' +
      '      setTodos([...todos, { id: Date.now().toString(), text: input, completed: false }])\n' +
      '      setInput("")\n' +
      '    }\n' +
      '  }\n\n' +
      '  const toggleTodo = (id: string) => {\n' +
      '    setTodos(todos.map(todo => \n' +
      '      todo.id === id ? { ...todo, completed: !todo.completed } : todo\n' +
      '    ))\n' +
      '  }\n\n' +
      '  const deleteTodo = (id: string) => {\n' +
      '    setTodos(todos.filter(todo => todo.id !== id))\n' +
      '  }\n\n' +
      '  return (\n' +
      '    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">\n' +
      '      <div className="max-w-2xl mx-auto">\n' +
      '        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">\n' +
      '          Todo List App\n' +
      '        </h1>\n' +
      '        \n' +
      '        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">\n' +
      '          <div className="flex gap-2">\n' +
      '            <input\n' +
      '              type="text"\n' +
      '              value={input}\n' +
      '              onChange={(e) => setInput(e.target.value)}\n' +
      '              onKeyPress={(e) => e.key === "Enter" && addTodo()}\n' +
      '              placeholder="أضف مهمة جديدة..."\n' +
      '              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"\n' +
      '            />\n' +
      '            <button\n' +
      '              onClick={addTodo}\n' +
      '              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"\n' +
      '            >\n' +
      '              <Plus className="w-5 h-5" />\n' +
      '              إضافة\n' +
      '            </button>\n' +
      '          </div>\n' +
      '        </div>\n\n' +
      '        <div className="space-y-2">\n' +
      '          {todos.length === 0 ? (\n' +
      '            <div className="text-center py-12 text-gray-500">\n' +
      '              <p>لا توجد مهام حالياً. أضف مهمة جديدة!</p>\n' +
      '            </div>\n' +
      '          ) : (\n' +
      '            todos.map((todo) => (\n' +
      '              <div\n' +
      '                key={todo.id}\n' +
      '                className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3 hover:shadow-lg transition-shadow"\n' +
      '              >\n' +
      '                <button\n' +
      '                  onClick={() => toggleTodo(todo.id)}\n' +
      '                  className={\\`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${\n' +
      '                    todo.completed\n' +
      '                      ? "bg-green-500 border-green-500"\n' +
      '                      : "border-gray-300 hover:border-green-500"\n' +
      '                  }\\`}\n' +
      '                >\n' +
      '                  {todo.completed && <Check className="w-4 h-4 text-white" />}\n' +
      '                </button>\n' +
      '                <span\n' +
      '                  className={\\`flex-1 ${\n' +
      '                    todo.completed\n' +
      '                      ? "line-through text-gray-400"\n' +
      '                      : "text-gray-800"\n' +
      '                  }\\`}\n' +
      '                >\n' +
      '                  {todo.text}\n' +
      '                </span>\n' +
      '                <button\n' +
      '                  onClick={() => deleteTodo(todo.id)}\n' +
      '                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"\n' +
      '                >\n' +
      '                  <Trash2 className="w-5 h-5" />\n' +
      '                </button>\n' +
      '              </div>\n' +
      '            ))\n' +
      '          )}\n' +
      '        </div>\n\n' +
      '        {todos.length > 0 && (\n' +
      '          <div className="mt-6 text-center text-gray-600">\n' +
      '            <p>\n' +
      '              {todos.filter(t => t.completed).length} من {todos.length} مهام مكتملة\n' +
      '            </p>\n' +
      '          </div>\n' +
      '        )}\n' +
      '      </div>\n' +
      '    </div>\n' +
      '  )\n' +
      '}',
    language: "tsx",
  },
  {
    name: "package.json",
    content: '{\n' +
      '  "name": "demo-todo-app",\n' +
      '  "version": "1.0.0",\n' +
      '  "private": true,\n' +
      '  "scripts": {\n' +
      '    "dev": "next dev",\n' +
      '    "build": "next build",\n' +
      '    "start": "next start"\n' +
      '  },\n' +
      '  "dependencies": {\n' +
      '    "next": "16.0.10",\n' +
      '    "react": "19.2.0",\n' +
      '    "react-dom": "19.2.0",\n' +
      '    "lucide-react": "^0.454.0"\n' +
      '  },\n' +
      '  "devDependencies": {\n' +
      '    "@types/node": "^22",\n' +
      '    "@types/react": "^19",\n' +
      '    "@types/react-dom": "^19",\n' +
      '    "typescript": "^5"\n' +
      '  }\n' +
      '}',
    language: "json",
  },
  {
    name: "tsconfig.json",
    content: '{\n' +
      '  "compilerOptions": {\n' +
      '    "target": "ES2020",\n' +
      '    "lib": ["dom", "dom.iterable", "esnext"],\n' +
      '    "allowJs": true,\n' +
      '    "skipLibCheck": true,\n' +
      '    "strict": true,\n' +
      '    "noEmit": true,\n' +
      '    "esModuleInterop": true,\n' +
      '    "module": "esnext",\n' +
      '    "moduleResolution": "bundler",\n' +
      '    "resolveJsonModule": true,\n' +
      '    "isolatedModules": true,\n' +
      '    "jsx": "preserve",\n' +
      '    "incremental": true,\n' +
      '    "plugins": [\n' +
      '      {\n' +
      '        "name": "next"\n' +
      '      }\n' +
      '    ],\n' +
      '    "paths": {\n' +
      '      "@/*": ["./*"]\n' +
      '    }\n' +
      '  },\n' +
      '  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],\n' +
      '  "exclude": ["node_modules"]\n' +
      '}',
    language: "json",
  },
  {
    name: "tailwind.config.js",
    content: '/** @type {import(\\\'tailwindcss\\\').Config} */\n' +
      'module.exports = {\n' +
      '  content: [\n' +
      '    \'./app/**/*.{js,ts,jsx,tsx}\',\n' +
      '    \'./components/**/*.{js,ts,jsx,tsx}\',\n' +
      '  ],\n' +
      '  theme: {\n' +
      '    extend: {},\n' +
      '  },\n' +
      '  plugins: [],\n' +
      '}',
    language: "javascript",
  },
  {
    name: "README.md",
    content: '# Todo List App\n\n' +
      'مشروع Todo List بسيط مبني بـ Next.js و React.\n\n' +
      '## الميزات\n\n' +
      '- إضافة مهام جديدة\n' +
      '- تحديد المهام كمكتملة\n' +
      '- حذف المهام\n' +
      '- عداد المهام المكتملة\n\n' +
      '## التشغيل\n\n' +
      '```bash\n' +
      'npm install\n' +
      'npm run dev\n' +
      '```\n\n' +
      'افتح [http://localhost:3000](http://localhost:3000) في المتصفح.',
    language: "markdown",
  },
]
