import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';

// ES Module imports workaround
const traverse = traverseModule.default || traverseModule;
const generate = generateModule.default || generateModule;

const ARABIC_REGEX = /[\u0600-\u06FF]/;

const SRC_DIR = path.join(process.cwd(), 'src');
const TRANSLATION_MAP = {};

function processFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  if (!ARABIC_REGEX.test(code)) return; // Skip files without Arabic

  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  let needsI18n = false;

  traverse(ast, {
    JSXText(path) {
      if (ARABIC_REGEX.test(path.node.value)) {
        const text = path.node.value.trim();
        if (!text) return;
        TRANSLATION_MAP[text] = text; // Just store original for now
        
        path.replaceWith(
          t.jsxExpressionContainer(
            t.callExpression(
              t.memberExpression(t.identifier('i18n'), t.identifier('t')),
              [t.stringLiteral(text)]
            )
          )
        );
        path.skip();
        needsI18n = true;
      }
    },
    StringLiteral(path) {
      // Avoid modifying import declarations
      if (path.parent.type === 'ImportDeclaration' || path.parent.type === 'CallExpression' && path.parent.callee.property && path.parent.callee.property.name === 't') return;
      
      if (ARABIC_REGEX.test(path.node.value)) {
        const text = path.node.value;
        TRANSLATION_MAP[text] = text;
        
        const callExpr = t.callExpression(
          t.memberExpression(t.identifier('i18n'), t.identifier('t')),
          [t.stringLiteral(text)]
        );

        if (path.parent.type === 'JSXAttribute') {
          path.replaceWith(t.jsxExpressionContainer(callExpr));
        } else {
          path.replaceWith(callExpr);
        }
        path.skip();
        needsI18n = true;
      }
    },
    TemplateLiteral(path) {
      // For simplicity, we just extract text from quasis if it has arabic, but template strings are complex.
      // Let's do a basic conversion if it has only one arabic string and no complex vars, or skip.
    }
  });

  if (needsI18n) {
    // Add import i18n from ...
    const depth = filePath.replace(SRC_DIR, '').split(path.sep).length - 2;
    const prefix = depth <= 0 ? './' : '../'.repeat(depth);
    const importPath = `${prefix}utils/i18n`;
    
    // Check if imported
    let hasImport = false;
    traverse(ast, {
      ImportDeclaration(p) {
        if (p.node.source.value.includes('utils/i18n')) hasImport = true;
      }
    });

    if (!hasImport) {
      ast.program.body.unshift(
        t.importDeclaration(
          [t.importDefaultSpecifier(t.identifier('i18n'))],
          t.stringLiteral(importPath)
        )
      );
    }

    const output = generate(ast, {}, code);
    fs.writeFileSync(filePath, output.code);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      if (!fullPath.includes('utils/i18n') && !fullPath.includes('translations.js')) {
        try {
          processFile(fullPath);
        } catch (e) {
          console.error(`Error processing ${fullPath}:`, e.message);
        }
      }
    }
  }
}

walkDir(SRC_DIR);
fs.writeFileSync('extracted_strings.json', JSON.stringify(TRANSLATION_MAP, null, 2));
console.log(`Extracted ${Object.keys(TRANSLATION_MAP).length} strings.`);
