# doc-verify

A CLI tool that extracts code snippets from markdown documentation and executes them in sandboxed Docker containers to verify they actually work.

[![npm version](https://img.shields.io/npm/v/@shaik_munawar/doc-verify.svg)](https://www.npmjs.com/package/@shaik_munawar/doc-verify)
[![GitHub Packages](https://img.shields.io/badge/GitHub%20Packages-doc--verify-blue?logo=github)](https://github.com/S-Munawar/doc-verify/pkgs/npm/doc-verify)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-DocVerify%20Action-green?logo=github)](https://github.com/marketplace/actions/docverify-action)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Why?

Documentation code examples often become outdated or contain bugs that slip through review. **doc-verify** ensures your code examples actually run by:

1. **Extracting** code blocks from markdown files
2. **Repairing** incomplete snippets using AI (mocks missing dependencies, completes partial code)
3. **Executing** each snippet in an isolated Docker container
4. **Reporting** pass/fail results with interactive debugging options

## Features

- 🐳 **Sandboxed Execution** - Each snippet runs in an isolated Docker container with no network access
- 🤖 **AI-Powered Repair** - Automatically completes incomplete code and mocks missing dependencies
- 🌍 **13+ Languages** - JavaScript, TypeScript, Python, Go, Rust, Ruby, Java, C, C++, Bash, PHP, Perl, Lua
- 🔄 **Interactive Mode** - Retry, skip, auto-fix, or debug failed snippets
- ⚡ **Parallel Processing** - Repairs snippets concurrently for faster execution
- 📦 **Caching** - Caches AI repairs to avoid redundant API calls
- 🔧 **Auto-fix** - Apply AI-generated fixes directly to your markdown files
- 🏷️ **Badge Updates** - Automatically updates verification badges in your docs

## Installation

```bash
# Install globally from npm
npm install -g @shaik_munawar/doc-verify

# Or use with npx
npx @shaik_munawar/doc-verify run README.md

# Install from GitHub Packages
npm install -g @s-munawar/doc-verify --registry=https://npm.pkg.github.com
```

### Prerequisites

- **Node.js** 18+
- **Docker** running locally
- **OpenAI-compatible API** (OpenAI, Ollama, etc.)

## Quick Start

1. Set up environment variables:

```bash
# .env
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.openai.com  # or your Ollama endpoint
OPENAI_MODEL_NAME=gpt-4o-mini           # or llama3:latest for Ollama
```

2. Run verification:

```bash
dv run README.md
```

## Usage

### Basic Commands

```bash
# Verify all code snippets in a markdown file
dv run README.md

# Filter by language
dv run README.md --lang python

# Clear the AI repair cache
dv clear
```

### Interactive Mode

When a snippet fails, you get interactive options:

```
  2. python  FAIL 
     Exited with code 1
? Action
  › Auto-fix     # Generate and apply AI fix to source file
    Details      # View original code, repaired code, and error
    Retry        # Re-run after clearing cache for this snippet  
    Clear cache  # Clear entire cache and restart
    Skip         # Skip this snippet
    Exit         # Exit immediately
```

### CLI Options

```
Usage: doc-verify [command] [options]

Commands:
  run <file>     Verify code snippets in a markdown file
  clear          Clear the AI repair cache

Options:
  -l, --lang <language>  Filter snippets by language
  -V, --version          Output version number
  -h, --help             Display help
```

## Supported Languages

| Language | Aliases | Docker Image |
|----------|---------|--------------|
| JavaScript | `js`, `javascript` | `node:18-alpine` |
| TypeScript | `ts`, `typescript` | `denoland/deno:latest` |
| Python | `py`, `python` | `python:3.11-alpine` |
| Go | `go`, `golang` | `golang:1.21-alpine` |
| Rust | `rs`, `rust` | `rust:1.74-alpine` |
| Ruby | `rb`, `ruby` | `ruby:3.2-alpine` |
| Java | `java` | `eclipse-temurin:17-alpine` |
| C | `c` | `gcc:13` |
| C++ | `cpp`, `c++` | `gcc:13` |
| Bash | `bash`, `sh`, `shell` | `alpine:latest` |
| PHP | `php` | `php:8.2-cli-alpine` |
| Perl | `perl` | `perl:5.38-slim` |
| Lua | `lua` | `nickblah/lua:5.4-alpine` |

## GitHub Action

Use doc-verify in your CI/CD pipeline:

```yaml
name: Verify Docs

on:
  push:
    paths:
      - '**.md'
  pull_request:
    paths:
      - '**.md'

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Verify Documentation
        uses: S-Munawar/doc-verify@v1
        with:
          file: README.md
          openai_api_key: ${{ secrets.OPENAI_API_KEY }}
          openai_api_base_url: ${{ secrets.OPENAI_BASE_URL }}
          openai_model_name: gpt-4o-mini
```

### Action Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `file` | No | `README.md` | Markdown file to verify |
| `language` | No | - | Filter by language |
| `openai_api_key` | Yes | - | API key for AI repairs |
| `openai_api_base_url` | Yes | - | Base URL for OpenAI-compatible API |
| `openai_model_name` | Yes | - | Model name to use |

## How It Works

### 1. Extraction

Parses markdown files using `remark` and extracts all fenced code blocks with language identifiers.

### 2. AI Repair

Documentation snippets are often incomplete (missing imports, undefined variables). The AI:
- Adds missing imports and dependencies
- Mocks external services (APIs, databases, etc.)
- Wraps code in async contexts if needed
- **Does NOT fix intentional bugs** - preserves the original logic

### 3. Sandboxed Execution

Each snippet runs in a Docker container with:
- **No network access** (`NetworkMode: 'none'`)
- **Memory limit** (128MB)
- **Auto-cleanup** (containers removed after execution)
- **Timeout protection**

### 4. Network Mocking (JS/TS)

For JavaScript/TypeScript, a network shim is injected that mocks:
- `fetch()` API calls
- Common HTTP libraries

This allows API examples to "work" without making real network requests.

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | API key for the LLM provider |
| `OPENAI_BASE_URL` | Base URL (e.g., `https://api.openai.com` or Ollama endpoint) |
| `OPENAI_MODEL_NAME` | Model to use (e.g., `gpt-4o-mini`, `llama3:latest`) |

### Using with Ollama

```bash
# Start Ollama
ollama serve

# Set environment
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://localhost:11434
OPENAI_MODEL_NAME=llama3:latest
```

## Architecture

```
src/
├── index.ts              # CLI entry point
├── parser/
│   └── extracts.ts       # Markdown parsing & snippet extraction
├── engine/
│   ├── runner.ts         # Execution orchestration
│   └── mocks/
│       └── network-shim.ts  # Network mocking for JS/TS
├── runners/
│   ├── base-runner.ts    # Abstract base class with Docker logic
│   ├── javascript-runner.ts
│   ├── typescript-runner.ts
│   ├── python-runner.ts
│   └── ...               # Language-specific runners
├── ai/
│   ├── repair.ts         # AI-powered code completion
│   ├── prompt.ts         # Language-specific prompts
│   └── cache.ts          # SHA256-based caching
└── utils/
    ├── badge.ts          # Badge update utility
    └── patcher.ts        # File patching for auto-fix
```

## Development

```bash
# Clone the repo
git clone https://github.com/S-Munawar/doc-verify.git
cd doc-verify

# Install dependencies
pnpm install

# Run in development mode
pnpm run dev run README.md

# Build
pnpm run build

# Bundle for distribution
pnpm run bundle
```

## License

ISC © Shaik Abdul Munawar
