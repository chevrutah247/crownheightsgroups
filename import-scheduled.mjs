#!/usr/bin/env node
/**
 * ShabbatHub — Import Scheduled Posts from JSON to Supabase
 * 
 * Source: scheduled2_clean.json (357 records exported from WordPress)
 * These are future-dated posts with PDF URLs already resolved.
 * 
 * Before running:
 *   1. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   2. Place scheduled2_clean.json in the same folder
 * 
 * Run:
 *   cd shabbathub-next
 *   node import-scheduled.mjs
 * 
 * Safe to re-run — already imported documents are skipped (by wp_original_id).
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ──
function loadEnv() {
  try {
    const content = readFileSync(resolve(__dirname, '.env.local'), 'utf-8');
    const vars = {};
    content.split('\n').forEach(line => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) vars[m[1].trim()] = m[2].trim();
    });
    return vars;
  } catch {
    console.error('❌ Cannot read .env.local — run from the shabbathub-next folder');
    process.exit(1);
  }
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env.local');
  console.error('   Need SUPABASE_SERVICE_ROLE_KEY to bypass RLS');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Week field → Parsha order number mapping ──
// These are Yiddish-style Russian transliterations used in the WordPress "week" field
const weekToParsha = {
  'Берейшис': 1,
  'Ноах': 2,
  'Лех Лехо': 3,
  'Вайейро': 4,
  'Хайей Соро': 5,
  'Толдойс': 6,
  'Вайейцей': 7,
  'Вайишлах': 8,
  'Вайейшев': 9,
  'Микейц': 10,
  'Вайигаш': 11,
  'Вайехи': 12,
  'Шмойс': 13,
  'Воэйро': 14,
  'Бой': 15,
  'Бешалах': 16,
  'Йисрой': 17,
  'Мишпотим': 18,
  'Трумо': 19,
  'Тецавэ': 20,
  'Ки Тисо': 21,
  'Ваякхел': 22,
  'Пкудэй': 23,
  'Вайикро': 24,
  'Цав': 25,
  'Шмини': 26,
  'Тазриа': 27,
  'Мецойра': 28,
  'Ахарэй Мойс': 29,
  'Кдойшим': 30,
  'Эмор': 31,
  'Бехар': 32,
  'Бехукойсай': 33,
  'Бамидбор': 34,
  'Насой': 35,
  'Беаалойсхо': 36,
  'Шлах': 37,
  'Койрах': 38,
  'Хукас': 39,
  'Болок': 40,
  'Пинхос': 41,
  'Матойс': 42,
  'Масэй': 43,
  'Дворин': 44,
  'Весханан': 45,
  'Айкав': 46,
  'Рэй': 47,
  'Шойфтим': 48,
  'Кисэйцей': 49,
  'Кисавой': 50,
  'Ницовим': 51,
  'Вайейлех': 52,
  'Аазину': 53,
  'Везойс Хаброхо': 54,
};

// ── Publication detection from title ──
const publicationPatterns = [
  { pattern: /шомрей\s*шаб/i, name_ru: 'Шомрей Шабос', name_en: 'Shomrei Shabbos', name_he: 'שומרי שבת', lang: 'ru' },
  { pattern: /наследие|фонд наследие/i, name_ru: 'Наследие', name_en: 'Nasledie', name_he: 'נחלה', lang: 'ru' },
  { pattern: /биркат\s*эли/i, name_ru: 'Биркат ЭлиГу', name_en: 'Birkat Eligu', name_he: 'ברכת אליהו', lang: 'ru' },
  { pattern: /хитас|hitas/i, name_ru: 'Хитас', name_en: 'Chitas', name_he: 'חת"ת', lang: 'ru' },
  { pattern: /свет торы/i, name_ru: 'Свет Торы', name_en: 'Svet Tory', name_he: 'אור התורה', lang: 'ru' },
  { pattern: /восхождение/i, name_ru: 'Восхождение', name_en: 'Ascent', name_he: 'עליה', lang: 'ru' },
  { pattern: /любите делать добро/i, name_ru: 'Любите делать добро', name_en: 'Lyubite Delat Dobro', name_he: 'אהבת חסד', lang: 'ru' },
  { pattern: /колодец\s*торы|torah\s*wellsprings/i, name_ru: 'Колодец Торы', name_en: 'Torah Wellsprings', name_he: 'באר התורה', lang: 'ru' },
  { pattern: /shabat[\-\s]*shalom|шабат[\-\s]*шалом/i, name_ru: 'Шабат Шалом', name_en: 'Shabat Shalom', name_he: 'שבת שלום', lang: 'ru' },
  { pattern: /darkeyshalom|даркей\s*шалом/i, name_ru: 'Даркей Шалом', name_en: 'Darkey Shalom', name_he: 'דרכי שלום', lang: 'ru' },
  { pattern: /торат\s*менахем/i, name_ru: 'Торат Менахем', name_en: 'Torat Menachem', name_he: 'תורת מנחם', lang: 'ru' },
  { pattern: /имрей\s*ноам/i, name_ru: 'Имрей Ноам', name_en: 'Imrei Noam', name_he: 'אמרי נועם', lang: 'ru' },
  { pattern: /wonders/i, name_ru: 'Нифлаот', name_en: 'Wonders', name_he: 'נפלאות', lang: 'en' },
  { pattern: /checking the simanim/i, name_ru: 'Симаним', name_en: 'Checking the Simanim', name_he: 'סימנים', lang: 'en' },
  { pattern: /двар\s*малх/i, name_ru: 'Двар Малхут', name_en: 'Dvar Malchut', name_he: 'דבר מלכות', lang: 'ru' },
  { pattern: /сихот\s*а-?геула|сихойс/i, name_ru: 'Сихот а-Геула', name_en: 'Sichot HaGeula', name_he: 'שיחות הגאולה', lang: 'ru' },
];

function detectPublication(title) {
  for (const pub of publicationPatterns) {
    if (pub.pattern.test(title)) return pub;
  }
  return null;
}

// ── Extract Hebrew year (57xx) from title ──
function extractHebrewYear(title, yearField) {
  const m = title.match(/\b(57[0-9]{2})\b/);
  if (m) return parseInt(m[1]);
  // Convert Gregorian year field to approximate Hebrew year
  if (yearField && /^\d{4}$/.test(yearField)) {
    const gy = parseInt(yearField);
    return gy + 3760; // approximate
  }
  return null;
}

// ── Extract issue number from title ──
function extractIssueNumber(title) {
  const patterns = [
    /№\s*(\d+)/,
    /#\s*(\d+)/,
    /[\s_](\d{3,4})[\s_-]/,
    /(\d{3,4})(?:\s*[-–]\s*\d{4})/,
  ];
  for (const p of patterns) {
    const m = title.match(p);
    if (m) return m[1];
  }
  return null;
}

// ── Language mapping ──
function mapLanguage(langField) {
  if (/рус/i.test(langField)) return 'ru';
  if (/англ/i.test(langField) || /eng/i.test(langField)) return 'en';
  if (/ивр/i.test(langField) || /heb/i.test(langField)) return 'he';
  // Detect from characters in title
  return 'ru';
}

// ══════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════
async function main() {
  console.log('🚀 ShabbatHub: Import Scheduled Posts → Supabase');
  console.log('═'.repeat(50) + '\n');

  // 1. Load JSON data
  let records;
  try {
    const jsonPath = resolve(__dirname, 'scheduled2_clean.json');
    records = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    console.log(`📄 Loaded ${records.length} scheduled records from JSON\n`);
  } catch (err) {
    console.error('❌ Cannot read scheduled2_clean.json:', err.message);
    console.error('   Place the file in the same folder as this script');
    process.exit(1);
  }

  // 2. Load parshiot from Supabase
  console.log('📖 Loading parshiot from Supabase...');
  const { data: parshiot, error: parshaErr } = await supabase
    .from('parshiot')
    .select('id, order_num, name_ru')
    .order('order_num');

  if (parshaErr || !parshiot?.length) {
    console.error('❌ Cannot load parshiot:', parshaErr?.message);
    process.exit(1);
  }

  const parshaMap = {};
  parshiot.forEach(p => { parshaMap[p.order_num] = p; });
  console.log(`   ✅ ${parshiot.length} parshiot loaded\n`);

  // 3. Load already-imported WP IDs
  const { data: existing } = await supabase
    .from('issues')
    .select('wp_original_id')
    .not('wp_original_id', 'is', null);

  const doneSet = new Set((existing || []).map(r => r.wp_original_id));
  console.log(`⏭️  Already imported: ${doneSet.size} documents\n`);

  // 4. Load/cache publications
  const { data: existingPubs } = await supabase
    .from('publications')
    .select('id, title_ru, title_en');

  const pubCache = new Map();
  if (existingPubs) {
    existingPubs.forEach(p => {
      if (p.title_ru) pubCache.set(p.title_ru, p.id);
      if (p.title_en) pubCache.set(p.title_en, p.id);
    });
  }

  async function getOrCreatePublication(pubInfo) {
    if (!pubInfo) return null;

    const cacheKey = pubInfo.name_ru;
    if (pubCache.has(cacheKey)) return pubCache.get(cacheKey);

    // Check by title_en too
    if (pubCache.has(pubInfo.name_en)) {
      pubCache.set(cacheKey, pubCache.get(pubInfo.name_en));
      return pubCache.get(pubInfo.name_en);
    }

    // Check in DB
    const { data: found } = await supabase
      .from('publications')
      .select('id')
      .or(`title_ru.eq.${pubInfo.name_ru},title_en.eq.${pubInfo.name_en}`)
      .maybeSingle();

    if (found) {
      pubCache.set(cacheKey, found.id);
      return found.id;
    }

    // Create new
    const { data: created, error } = await supabase
      .from('publications')
      .insert({
        title_ru: pubInfo.name_ru,
        title_en: pubInfo.name_en,
        title_he: pubInfo.name_he,
        primary_language: pubInfo.lang || 'ru',
        is_active: true,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`   ❌ Cannot create publication "${pubInfo.name_ru}":`, error.message);
      return null;
    }

    console.log(`   📰 Created publication: ${pubInfo.name_ru} (id: ${created.id})`);
    pubCache.set(cacheKey, created.id);
    return created.id;
  }

  // 5. Import records
  let ok = 0, skip = 0, fail = 0;
  const failed = [];

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const wpId = parseInt(rec.id);
    const title = rec.title;

    // Skip already imported
    if (doneSet.has(wpId)) {
      skip++;
      continue;
    }

    // Skip records without PDF
    if (!rec.pdf_url) {
      console.log(`   ⚠️  No PDF URL: "${title.substring(0, 50)}"`);
      failed.push({ id: wpId, title, reason: 'no_pdf_url' });
      fail++;
      continue;
    }

    // Resolve parsha from "week" field
    let parshaId = null;
    const parshaOrderNum = weekToParsha[rec.week] || null;
    if (parshaOrderNum && parshaMap[parshaOrderNum]) {
      parshaId = parshaMap[parshaOrderNum].id;
    }

    // Detect publication from title
    const pubInfo = detectPublication(title);
    const publicationId = await getOrCreatePublication(pubInfo);

    // Extract metadata
    const hebrewYear = extractHebrewYear(title, rec.year);
    const issueNumber = extractIssueNumber(title);

    // Parse date (format: "2025-09-01 00:51:24")
    const gregDate = rec.date ? rec.date.split(' ')[0] : null;

    const row = {
      title,
      pdf_url: rec.pdf_url,
      gregorian_date: gregDate,
      hebrew_year: hebrewYear,
      issue_number: issueNumber || null,
      parsha_id: parshaId,
      publication_id: publicationId,
      is_active: true,
      wp_original_id: wpId,
    };

    const { error } = await supabase.from('issues').insert([row]);

    if (error) {
      console.log(`   ❌ [${wpId}] "${title.substring(0, 45)}": ${error.message}`);
      failed.push({ id: wpId, title, reason: error.message });
      fail++;
    } else {
      ok++;
      const pName = parshaOrderNum ? ` [${parshaMap[parshaOrderNum]?.name_ru}]` : '';
      const pubName = pubInfo ? ` (${pubInfo.name_ru})` : '';
      if (ok % 20 === 0 || ok <= 5) {
        console.log(`   ✅ ${ok}: ${title.substring(0, 50)}${pName}${pubName}`);
      }
    }
  }

  // 6. Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 Import Summary:');
  console.log(`   ✅ Imported: ${ok}`);
  console.log(`   ⏭️  Skipped (already exists): ${skip}`);
  console.log(`   ❌ Errors: ${fail}`);
  console.log(`   📄 Total in JSON: ${records.length}`);
  console.log('═'.repeat(50));

  if (failed.length > 0) {
    writeFileSync('scheduled-import-errors.json', JSON.stringify(failed, null, 2));
    console.log('\n💡 Errors saved to scheduled-import-errors.json');
    console.log('   Re-run to retry — already imported will be skipped.');
  }

  console.log('\n✨ Done!');
}

main().catch(err => {
  console.error('💀 Fatal error:', err);
  process.exit(1);
});
