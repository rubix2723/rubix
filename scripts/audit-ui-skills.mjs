import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = 'E:\\rubix-studio\\src';

function getAllFiles(dir, exts = ['.astro', '.tsx', '.ts', '.css']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, exts));
    } else if (exts.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  }
  return results;
}

const allFiles = getAllFiles(SRC_DIR);

const auditResults = {
  hScreenViolations: [],
  textBalanceOpportunities: [],
  textPrettyOpportunities: [],
  tabularNumsOpportunities: [],
  iconButtonsWithoutAriaLabel: [],
  missingFocusVisible: [],
  decorativeIconsAriaHidden: [],
  rawHexValuesInComponents: [],
  arbitraryZIndices: [],
  sizeUtilityOpportunities: [],
  transitionDurationViolations: [],
  reducedMotionHandling: [],
  summary: {
    totalFilesAudited: allFiles.length,
    score: 0,
    strengths: [],
    violations: [],
    recommendations: []
  }
};

for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative('E:\\rubix-studio', filePath).replace(/\\/g, '/');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // 1. h-screen vs h-dvh
    if (line.includes('h-screen') && !line.includes('min-h-screen')) {
      auditResults.hScreenViolations.push({
        file: relPath,
        line: lineNum,
        snippet: line.trim()
      });
    }

    // 2. Headings missing text-balance
    if (/<(h1|h2|h3)[^>]*class="[^"]*"[^>]*>/i.test(line)) {
      if (!line.includes('text-balance')) {
        auditResults.textBalanceOpportunities.push({
          file: relPath,
          line: lineNum,
          snippet: line.trim()
        });
      }
    }

    // 3. Paragraphs missing text-pretty
    if (/<p[^>]*class="[^"]*"[^>]*>/i.test(line)) {
      if (!line.includes('text-pretty')) {
        auditResults.textPrettyOpportunities.push({
          file: relPath,
          line: lineNum,
          snippet: line.trim()
        });
      }
    }

    // 4. Tabular numbers in index/metrics/time
    if (/(0[1-9]|\d{2,}\s*(min|s|ms|wks|px|%))/i.test(line) && !line.includes('tabular-nums') && !relPath.endsWith('.ts')) {
      if (line.includes('class="') && !line.includes('font-mono') && !line.includes('tabular-nums')) {
        auditResults.tabularNumsOpportunities.push({
          file: relPath,
          line: lineNum,
          snippet: line.trim()
        });
      }
    }

    // 5. Buttons without aria-label (icon buttons especially)
    if (/<button[^>]*>/i.test(line) && !line.includes('aria-label') && !line.includes('aria-labelledby')) {
      // Check if button contains text or is icon only
      if (!line.includes('>Start') && !line.includes('>Contact') && !line.includes('>Submit')) {
        auditResults.iconButtonsWithoutAriaLabel.push({
          file: relPath,
          line: lineNum,
          snippet: line.trim()
        });
      }
    }

    // 6. Interactive elements missing focus-visible
    if (/(<button|<a\s)[^>]*class="[^"]*"[^>]*>/i.test(line)) {
      if (!line.includes('focus-visible') && !line.includes('pointer-events-none') && !relPath.includes('icons/')) {
        auditResults.missingFocusVisible.push({
          file: relPath,
          line: lineNum,
          snippet: line.trim()
        });
      }
    }

    // 7. Sizing: w-X h-X that could be size-X
    const sizeMatch = line.match(/\bw-(\d+|\[\w+\])\s+h-(\d+|\[\w+\])\b/);
    if (sizeMatch && sizeMatch[1] === sizeMatch[2]) {
      auditResults.sizeUtilityOpportunities.push({
        file: relPath,
        line: lineNum,
        found: `w-${sizeMatch[1]} h-${sizeMatch[2]}`,
        replaceWith: `size-${sizeMatch[1]}`,
        snippet: line.trim()
      });
    }

    // 8. Raw hex values in components (excluding design-tokens.css and shaders)
    if (!relPath.includes('design-tokens.css') && !relPath.includes('shader') && !relPath.includes('liquid-mercury')) {
      const hexMatches = line.match(/#[0-9a-fA-F]{3,8}/g);
      if (hexMatches) {
        auditResults.rawHexValuesInComponents.push({
          file: relPath,
          line: lineNum,
          hexes: hexMatches,
          snippet: line.trim()
        });
      }
    }

    // 9. Transitions > 200ms for UI interaction feedback
    const durMatch = line.match(/duration-(\d+)/);
    if (durMatch && parseInt(durMatch[1], 10) > 200 && (line.includes('hover:') || line.includes('focus:') || line.includes('cursor-pointer'))) {
      auditResults.transitionDurationViolations.push({
        file: relPath,
        line: lineNum,
        duration: durMatch[1],
        snippet: line.trim()
      });
    }
  });
}

console.log('=== IBELICK / UI-SKILLS BASELINE AUDIT RESULTS ===\n');
console.log(`Audited ${allFiles.length} files across src/\n`);

console.log(`1. h-screen vs h-dvh Violations: ${auditResults.hScreenViolations.length}`);
auditResults.hScreenViolations.forEach(v => console.log(`   - [${v.file}:${v.line}] ${v.snippet}`));

console.log(`\n2. Headings Missing text-balance: ${auditResults.textBalanceOpportunities.length}`);
auditResults.textBalanceOpportunities.slice(0, 5).forEach(v => console.log(`   - [${v.file}:${v.line}] ${v.snippet}`));
if (auditResults.textBalanceOpportunities.length > 5) console.log(`   ... and ${auditResults.textBalanceOpportunities.length - 5} more`);

console.log(`\n3. Paragraphs Missing text-pretty: ${auditResults.textPrettyOpportunities.length}`);
auditResults.textPrettyOpportunities.slice(0, 5).forEach(v => console.log(`   - [${v.file}:${v.line}] ${v.snippet}`));
if (auditResults.textPrettyOpportunities.length > 5) console.log(`   ... and ${auditResults.textPrettyOpportunities.length - 5} more`);

console.log(`\n4. Missing focus-visible on Interactive Controls: ${auditResults.missingFocusVisible.length}`);
auditResults.missingFocusVisible.forEach(v => console.log(`   - [${v.file}:${v.line}] ${v.snippet}`));

console.log(`\n5. Square size-* Utility Opportunities: ${auditResults.sizeUtilityOpportunities.length}`);
auditResults.sizeUtilityOpportunities.slice(0, 5).forEach(v => console.log(`   - [${v.file}:${v.line}] ${v.found} -> ${v.replaceWith}`));

console.log(`\n6. Raw Hex Codes in Components: ${auditResults.rawHexValuesInComponents.length}`);
auditResults.rawHexValuesInComponents.forEach(v => console.log(`   - [${v.file}:${v.line}] ${v.hexes.join(', ')} in: ${v.snippet.slice(0, 60)}...`));

console.log(`\n7. Interactive Transitions > 200ms: ${auditResults.transitionDurationViolations.length}`);
auditResults.transitionDurationViolations.forEach(v => console.log(`   - [${v.file}:${v.line}] duration-${v.duration}`));

fs.writeFileSync('qa-captures/ui-skills-audit.json', JSON.stringify(auditResults, null, 2));
console.log('\nSaved full audit to qa-captures/ui-skills-audit.json');
