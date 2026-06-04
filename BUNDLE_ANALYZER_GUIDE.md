# 📊 Bundle Analyzer Guide

## Tools Installed

1. **source-map-explorer** ✅
   - Simple and works directly with built files
   - Shows package sizes in terminal
   - Can generate HTML reports

2. **webpack-bundle-analyzer** ✅
   - More advanced visualization
   - Requires webpack stats file (complex with react-scripts)

---

## Usage

### Method 1: Source Map Explorer (Recommended)

**Terminal Output:**
```bash
npm run analyze
```

This will:
1. Build with source maps enabled
2. Display bundle analysis in terminal
3. Show which packages take up space

**HTML Report:**
```bash
npm run analyze-html
```

This will:
1. Build with source maps enabled
2. Generate `bundle-report.html` file
3. Open it in browser for visual analysis

---

### Method 2: Manual Analysis

**Check bundle sizes after build:**
```bash
npm run build
# Check the output - React Scripts shows file sizes
```

**View files in build folder:**
```bash
# Windows PowerShell
Get-ChildItem build\static\js\*.js | Select-Object Name, Length | Format-Table

# Or check the build output directly
```

---

## Understanding the Output

### Terminal Output Example:
```
analyze: 'build/static/js/main.abc123.js' (123456 bytes)
  react: 45.2%
  react-dom: 23.1%
  @tanstack/react-query: 8.5%
  @supabase/supabase-js: 6.2%
  ...
```

### What to Look For:
- **Large percentages (>10%)**: Consider code splitting or alternatives
- **Duplicate dependencies**: Same package in multiple chunks
- **Unexpectedly large packages**: Review if truly needed

---

## Troubleshooting

### Error: "Couldn't read webpack bundle stats"
- **Solution:** Use `source-map-explorer` instead (already configured)

### Error: "No source maps found"
- **Solution:** Use `GENERATE_SOURCEMAP=true` (included in analyze script)

### Want Visual Treemap?
- **Option 1:** Use `analyze-html` to generate HTML report
- **Option 2:** Consider ejecting (not recommended) or using react-app-rewired

---

## Quick Reference

```bash
# Simple analysis (terminal)
npm run analyze

# HTML report
npm run analyze-html

# Build only (check sizes in output)
npm run build
```

---

## Tips

1. **Always analyze production builds** - Development builds are not optimized
2. **Compare before/after** - Track bundle size changes
3. **Focus on large chunks** - Optimize the biggest wins first
4. **Check for duplicates** - Same library in multiple chunks = opportunity

---

**Last Updated:** Current session  
**Recommended Tool:** source-map-explorer  
**Status:** ✅ Ready to use

