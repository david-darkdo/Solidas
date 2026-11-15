import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();

const SCANNER_EXCLUSIONS = new Set([
  ".env.example",
  ".gitleaks.toml",
  "scripts/check-secrets.mjs",
  "package-lock.json",
  "bun.lock",
]);

const FORBIDDEN_CONTENT_PATTERNS = [
  {
    name: "Cloudinary connection string with secret",
    regex: /cloudinary:\/\/[0-9]{10,20}:[A-Za-z0-9_-]{16,}@[a-z0-9_-]+/g,
  },
  {
    name: "Hardcoded CLOUDINARY_API_SECRET literal",
    regex: /CLOUDINARY_API_SECRET\s*=\s*[^\n;]*(?:\|\|\s*)?["'][A-Za-z0-9_-]{16,}["']/g,
  },
  {
    name: "Hardcoded CLOUDINARY_API_KEY literal",
    regex: /CLOUDINARY_API_KEY\s*=\s*[^\n;]*(?:\|\|\s*)?["'][0-9]{10,20}["']/g,
  },
  {
    name: "Client-exposed VITE_ private credential read",
    regex:
      /(?:process\.env|import\.meta\.env)\.VITE_(?:CLOUDINARY_API_SECRET|CLOUDINARY_API_KEY|SUPABASE_SERVICE_ROLE_KEY)\b/g,
  },
  {
    name: "Private key material",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
];

const PRIVATE_ENV_KEY_NAMES = [
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_API_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ACCESS_TOKEN",
  "VERCEL_TOKEN",
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
  "MBS_SEO_API_KEY",
];

function getTrackedFiles() {
  try {
    const out = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" });
    return out.split(/\r?\n/).filter(Boolean);
  } catch {
    const files = [];
    function walk(dir) {
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        if (["node_modules", ".git", "dist", ".output", ".vercel", ".tanstack"].includes(ent.name))
          continue;
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) walk(full);
        else files.push(path.relative(ROOT, full).replace(/\\/g, "/"));
      }
    }
    walk(ROOT);
    return files;
  }
}

const issues = [];
const tracked = getTrackedFiles();

for (const rel of tracked) {
  if (/^\.vercel\//.test(rel) || /^dist\//.test(rel) || /^\.output\//.test(rel)) {
    issues.push(`Build output artifact tracked in git: ${rel}`);
    continue;
  }

  // Check tracked .env files for private keys
  if (/^\.env($|\.)/.test(path.basename(rel)) && rel !== ".env.example") {
    const full = path.join(ROOT, rel);
    if (fs.existsSync(full)) {
      const lines = fs.readFileSync(full, "utf8").split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed
          .slice(eq + 1)
          .trim()
          .replace(/^["']|["']$/g, "");
        if (PRIVATE_ENV_KEY_NAMES.includes(key) && val.length > 0) {
          issues.push(`Private credential "${key}" found in tracked environment file: ${rel}`);
        }
      }
    }
  }

  if (SCANNER_EXCLUSIONS.has(rel)) continue;
  if (/\.(png|jpg|jpeg|webp|gif|ico|woff2?|ttf|eot|mp4|webm|pdf)$/i.test(rel)) continue;

  const fullPath = path.join(ROOT, rel);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, "utf8");

  for (const rule of FORBIDDEN_CONTENT_PATTERNS) {
    rule.regex.lastIndex = 0;
    if (rule.regex.test(content)) {
      issues.push(`${rule.name} detected in ${rel}`);
    }
  }
}

// Check built client bundles (if present) for leaked private markers
const clientOutputDirs = [".vercel/output/static", "dist/client", ".output/public"];

for (const dirRel of clientOutputDirs) {
  const dirAbs = path.join(ROOT, dirRel);
  if (!fs.existsSync(dirAbs)) continue;
  const stack = [dirAbs];
  while (stack.length) {
    const cur = stack.pop();
    for (const ent of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, ent.name);
      if (ent.isDirectory()) stack.push(full);
      else if (/\.(m?js|html|json)$/.test(ent.name)) {
        const body = fs.readFileSync(full, "utf8");
        if (body.includes("CLOUDINARY_API_SECRET") || /cloudinary:\/\/[0-9]+:/.test(body)) {
          issues.push(
            `Private Cloudinary marker found in client build asset: ${path.relative(ROOT, full).replace(/\\/g, "/")}`,
          );
        }
      }
    }
  }
}

if (issues.length > 0) {
  console.error("Secret hygiene check FAILED:");
  for (const issue of issues) {
    console.error(`  - ${issue}`);
  }
  process.exit(1);
}

console.log(`Secret hygiene check PASSED (${tracked.length} tracked files checked).`);
