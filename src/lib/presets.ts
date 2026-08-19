export interface LanguageOption {
  id: string;
  label: string;
  ext: string;
  popular?: boolean;
  category?: "frontend" | "backend" | "systems" | "config" | "data";
}

export const ALL_LANGUAGES: LanguageOption[] = [
  // Popular Frontend / Fullstack
  { id: "typescript", label: "TypeScript / Next.js / React (TSX)", ext: "tsx", popular: true, category: "frontend" },
  { id: "javascript", label: "JavaScript / React (JSX)", ext: "jsx", popular: true, category: "frontend" },
  { id: "python", label: "Python (FastAPI / Django / Flask)", ext: "py", popular: true, category: "backend" },
  { id: "html", label: "HTML5", ext: "html", category: "frontend" },
  { id: "css", label: "CSS / Tailwind", ext: "css", category: "frontend" },
  { id: "scss", label: "SCSS / SASS", ext: "scss", category: "frontend" },
  { id: "vue", label: "Vue.js", ext: "vue", category: "frontend" },
  { id: "svelte", label: "Svelte", ext: "svelte", category: "frontend" },
  { id: "astro", label: "Astro", ext: "astro", category: "frontend" },

  // Backend & Systems
  { id: "rust", label: "Rust", ext: "rs", popular: true, category: "systems" },
  { id: "go", label: "Go (Golang)", ext: "go", popular: true, category: "backend" },
  { id: "cpp", label: "C++", ext: "cpp", popular: true, category: "systems" },
  { id: "c", label: "C", ext: "c", category: "systems" },
  { id: "csharp", label: "C# / .NET", ext: "cs", popular: true, category: "backend" },
  { id: "java", label: "Java / Spring Boot", ext: "java", popular: true, category: "backend" },
  { id: "kotlin", label: "Kotlin", ext: "kt", category: "backend" },
  { id: "swift", label: "Swift", ext: "swift", category: "systems" },
  { id: "php", label: "PHP / Laravel", ext: "php", category: "backend" },
  { id: "ruby", label: "Ruby / Rails", ext: "rb", category: "backend" },
  { id: "dart", label: "Dart / Flutter", ext: "dart", category: "frontend" },
  { id: "elixir", label: "Elixir / Phoenix", ext: "ex", category: "backend" },
  { id: "scala", label: "Scala", ext: "scala", category: "backend" },

  // Database, Query & Config
  { id: "sql", label: "SQL (PostgreSQL / MySQL)", ext: "sql", popular: true, category: "data" },
  { id: "prisma", label: "Prisma Schema", ext: "prisma", category: "data" },
  { id: "graphql", label: "GraphQL", ext: "graphql", category: "data" },
  { id: "json", label: "JSON", ext: "json", category: "config" },
  { id: "yaml", label: "YAML", ext: "yaml", category: "config" },
  { id: "toml", label: "TOML", ext: "toml", category: "config" },
  { id: "dockerfile", label: "Dockerfile", ext: "dockerfile", category: "config" },
  { id: "shell", label: "Shell / Bash", ext: "sh", category: "config" },
  { id: "markdown", label: "Markdown", ext: "md", category: "config" },
  { id: "plaintext", label: "Plain Text", ext: "txt", category: "config" },
];

export const EXT_TO_LANG: Record<string, string> = {
  // Python & Frameworks
  py: "python",
  pyw: "python",
  pyi: "python",

  // JS/TS & Modern Web Frameworks
  ts: "typescript",
  tsx: "typescript",
  mts: "typescript",
  cts: "typescript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  vue: "html",
  svelte: "html",
  astro: "html",

  // CSS & Preprocessors
  css: "css",
  pcss: "css",
  postcss: "css",
  scss: "scss",
  sass: "scss",
  less: "scss",

  // Systems & Compiled
  rs: "rust",
  go: "go",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  h: "c",
  c: "c",
  cs: "csharp",
  java: "java",
  kt: "kotlin",
  kts: "kotlin",
  swift: "swift",
  dart: "dart",
  scala: "scala",
  php: "php",
  rb: "ruby",
  ex: "elixir",
  exs: "elixir",

  // Data & Config
  sql: "sql",
  prisma: "graphql",
  graphql: "graphql",
  gql: "graphql",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  toml: "ini",
  env: "plaintext",
  dockerfile: "dockerfile",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  ps1: "powershell",
  md: "markdown",
  txt: "plaintext",
};

export const FRAMEWORK_PRESETS = [
  {
    id: "nextjs-server-action",
    label: "Next.js App Router (Server Action + Zod)",
    language: "typescript",
    filename: "actions.ts",
    code: `'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const TaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export async function createTaskAction(prevState: any, formData: FormData) {
  const validatedFields = TaskSchema.safeParse({
    title: formData.get("title"),
    priority: formData.get("priority"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid fields provided.",
    };
  }

  try {
    // Database mutation logic here
    revalidatePath("/dashboard/tasks");
    return { success: true, message: "Task created successfully" };
  } catch (error) {
    return { message: "Database connection failed" };
  }
}
`,
  },
  {
    id: "fastapi-async-crud",
    label: "FastAPI (Async Endpoint + Pydantic v2)",
    language: "python",
    filename: "main.py",
    code: `from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

app = FastAPI(title="Core Microservice", version="1.0.0")

class ItemCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    price: float = Field(..., gt=0.0, description="Item price must be positive")
    is_offer: bool | None = None

class ItemResponse(ItemCreate):
    id: int

# In-memory store
db: dict[int, dict] = {}

@app.post("/items/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(item: ItemCreate):
    item_id = len(db) + 1
    stored_item = {"id": item_id, **item.model_dump()}
    db[item_id] = stored_item
    return stored_item

@app.get("/items/{item_id}", response_model=ItemResponse)
async def read_item(item_id: int):
    if item_id not in db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Item with specified ID does not exist"
        )
    return db[item_id]
`,
  },
  {
    id: "react-custom-hook",
    label: "React (Custom Hook with AbortController)",
    language: "typescript",
    filename: "useFetchData.ts",
    code: `import { useState, useEffect } from "react";

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useFetchData<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    
    async function executeFetch() {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        const data = await response.json();
        setState({ data, isLoading: false, error: null });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setState({ data: null, isLoading: false, error: err });
        }
      }
    }

    executeFetch();

    return () => {
      controller.abort();
    };
  }, [url]);

  return state;
}
`,
  },
  {
    id: "nestjs-service",
    label: "NestJS (Injectable Service + Dependency Injection)",
    language: "typescript",
    filename: "users.service.ts",
    code: `import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  private readonly users = new Map<string, User>();

  async findById(id: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(\`User with ID "\${id}" not found\`);
    }
    return user;
  }

  async create(email: string): Promise<User> {
    const exists = Array.from(this.users.values()).some((u) => u.email === email);
    if (exists) {
      throw new ConflictException('Email is already registered');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      createdAt: new Date(),
    };

    this.users.set(newUser.id, newUser);
    return newUser;
  }
}
`,
  },
  {
    id: "django-model-view",
    label: "Django (Model + Generic ViewSet)",
    language: "python",
    filename: "views.py",
    code: `from django.db import models
from rest_framework import serializers, viewsets, permissions

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'created_at', 'is_active']

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.filter(is_active=True)
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
`,
  },
  {
    id: "tailwind-styles",
    label: "Tailwind CSS (Layered Component Utilities)",
    language: "css",
    filename: "globals.css",
    code: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;
  }
}

@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-xs font-mono font-bold tracking-wider text-black uppercase transition-all duration-150 hover:bg-slate-200 active:scale-95 shadow-lg;
  }

  .card-surface {
    @apply rounded-2xl border border-white/[0.08] bg-[#07090D]/80 backdrop-blur-xl p-5 shadow-2xl;
  }
}
`,
  },
];

export const DEFAULT_SNIPPETS: Record<string, { filename: string; code: string }> = {
  python: {
    filename: "main.py",
    code: FRAMEWORK_PRESETS[1].code,
  },
  typescript: {
    filename: "page.tsx",
    code: FRAMEWORK_PRESETS[0].code,
  },
  javascript: {
    filename: "App.jsx",
    code: FRAMEWORK_PRESETS[2].code,
  },
  css: {
    filename: "globals.css",
    code: FRAMEWORK_PRESETS[5].code,
  },
};

export function getExtensionForLang(langId: string): string {
  const matched = ALL_LANGUAGES.find((l) => l.id === langId);
  return matched ? matched.ext : "txt";
}

export function detectLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_LANG[ext] ?? "plaintext";
}