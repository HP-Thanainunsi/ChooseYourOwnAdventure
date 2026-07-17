/**
 * database/init.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates the database schema and seeds dummy data using sql.js.
 * Supports dynamic Content Management System (CMS) where 1 Story is strictly
 * tied to 1 Game stage via GameStages and Options.
 *
 * Run standalone:  node src/database/init.js
 * Via npm script:  npm run init-db
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Score system (HIDDEN from clients):
 *
 *  Stage 1  swipe      (step_order: 1) – Slow stretch → 0   | Jump up → 5
 *  Stage 2  mixology   (step_order: 2) – Nature → 1         | Conversation → 3  | Achievement → 5
 *  Stage 3  tarot      (step_order: 3) – Priestess → 0      | Wheel → 3         | Tower → 5
 *
 *  Max score = 15  (5 + 5 + 5)
 *
 *  Drinks:
 *   Sparkling Water    →  0 – 5
 *   Tropical Smoothie  →  6 – 11
 *   Dark Espresso      → 12 – 15
 */

'use strict';

const { initDb, getDb, saveDb, runInsert, queryOne, queryAll } = require('./db');

// ─── DDL ──────────────────────────────────────────────────────────────────────
// ─── DDL ──────────────────────────────────────────────────────────────────────
async function createSchema(db) {
  // Check if old Questions table exists or if Options has question_id, drop old tables to migrate cleanly
  const hasQuestions = await queryOne(db, "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='Questions'");
  if (hasQuestions && hasQuestions.count > 0) {
    console.log('🔄 Migrating schema: Replacing Questions table with GameStages...');
    await db.run('DROP TABLE IF EXISTS Options');
    await db.run('DROP TABLE IF EXISTS Questions');
  } else {
    const optionsInfo = await queryAll(db, "PRAGMA table_info(Options)");
    if (optionsInfo && optionsInfo.some((col) => col.name === 'question_id')) {
      console.log('🔄 Upgrading Options table: replacing question_id with stage_id...');
      await db.run('DROP TABLE IF EXISTS Options');
    }
  }

  await db.run(`
    CREATE TABLE IF NOT EXISTS Locations (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      name             TEXT    NOT NULL,
      address          TEXT    NOT NULL,
      latitude         REAL    NOT NULL,
      longitude        REAL    NOT NULL,
      google_maps_link TEXT    NOT NULL
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS Drinks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL UNIQUE,
      description TEXT    NOT NULL,
      image_url   TEXT,
      min_score   INTEGER NOT NULL,
      max_score   INTEGER NOT NULL,
      abv         INTEGER NOT NULL DEFAULT 1 CHECK(abv BETWEEN 1 AND 5),
      sweetness   INTEGER NOT NULL DEFAULT 1 CHECK(sweetness BETWEEN 1 AND 5),
      location_id INTEGER REFERENCES Locations(id),
      CHECK (min_score <= max_score)
    )
  `);

  // Ensure location_id exists if Drinks table was already created in an earlier session
  try {
    await db.run(`ALTER TABLE Drinks ADD COLUMN location_id INTEGER REFERENCES Locations(id)`);
  } catch (_e) {
    console.debug('Note: Drinks table location_id check:', _e.message);
  }

  // ─── GameStages (formerly Questions) ────────────────────────────────────────
  await db.run(`
    CREATE TABLE IF NOT EXISTS GameStages (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      step_order           INTEGER NOT NULL UNIQUE,
      story_text           TEXT    NOT NULL,
      game_type            TEXT    NOT NULL CHECK(game_type IN ('swipe','mixology','tarot','drag_drop')),
      background_image_url TEXT
    )
  `);

  // ─── Options (now references GameStages via stage_id) ───────────────────────
  await db.run(`
    CREATE TABLE IF NOT EXISTS Options (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      stage_id     INTEGER NOT NULL REFERENCES GameStages(id) ON DELETE CASCADE,
      label        TEXT    NOT NULL,
      image_url    TEXT,
      score_weight INTEGER NOT NULL DEFAULT 0,
      sub_question TEXT
    )
  `);

  try {
    await db.run(`ALTER TABLE Options ADD COLUMN sub_question TEXT`);
  } catch (_e) {
    console.debug('Note: Options table sub_question check:', _e.message);
  }

  console.log('✅  Schema created (GameStages & Options verified).');
}

// ─── DML (seed) ───────────────────────────────────────────────────────────────
async function seedData(db, forceReset = false) {
  // Check & Seed Locations
  const locExisting = await queryOne(db, 'SELECT COUNT(*) AS n FROM Locations');
  if (forceReset || !locExisting || Number(locExisting.n) === 0) {
    if (forceReset) await db.run('DELETE FROM Locations');
    await db.run(
      `INSERT INTO Locations (id, name, address, latitude, longitude, google_maps_link)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [1, 'Garden of Siam — The Grand Teak Lounge', '48 Oriental Avenue, Bang Rak, Bangkok 10500', 13.7240, 100.5140, 'https://maps.app.goo.gl/MandarinOrientalBangkok']
    );

    await db.run(
      `INSERT INTO Locations (id, name, address, latitude, longitude, google_maps_link)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [2, 'The Sanctuary Speakeasy at Garden of Siam', 'Soi Nai Lert, Wireless Road, Pathum Wan, Bangkok 10330', 13.7432, 100.5475, 'https://maps.app.goo.gl/SanctuarySpeakeasyBangkok']
    );

    await db.run(
      `INSERT INTO Locations (id, name, address, latitude, longitude, google_maps_link)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [3, 'The Moonlight Promenade Bar', '152 Wireless Rd, Lumphini, Pathum Wan, Bangkok 10330', 13.7360, 100.5478, 'https://maps.app.goo.gl/MoonlightPromenadeBangkok']
    );
    console.log('📍  Seeded 3 Luxury Hotel Bar Locations in Bangkok.');
  }

  // Idempotent: check if Drinks already seeded
  const drinksExisting = await queryOne(db, 'SELECT COUNT(*) AS n FROM Drinks');
  if (forceReset || !drinksExisting || Number(drinksExisting.n) === 0) {
    if (forceReset) await db.run('DELETE FROM Drinks');
    await db.run(
      `INSERT INTO Drinks (name, description, image_url, min_score, max_score, abv, sweetness, location_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Flawless Crystal Coupe Cocktail',
       'A flawless, crystal-clear coupe glass filled with a premium signature cocktail, glowing slightly in amber tones. Garnished with a delicate edible gold leaf and a single floating white orchid. Exclusively designed for the refined soul seeking serenity and timeless elegance.',
       '/images/drinks/crystal-coupe.png',
       -15, -1,
       2,   // abv: smooth and refined
       4,   // sweetness: subtle honey and floral sweetness
       2]   // location_id: The Sanctuary Speakeasy
    );

    await db.run(
      `INSERT INTO Drinks (name, description, image_url, min_score, max_score, abv, sweetness, location_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Moonlight Botanical Fizz',
       'A vibrant and aromatic elixir infused with rare royal herbs and night-blooming jasmine, topped with effervescent champagne mist. Perfect for the adventurous spirit who delights in the mysteries of the tropical garden under moonlight.',
       '/images/drinks/botanical-fizz.png',
       0, 4,
       3,   // abv: delightful champagne fizz
       3,   // sweetness: balanced botanical sweetness
       3]   // location_id: The Moonlight Promenade Bar
    );

    await db.run(
      `INSERT INTO Drinks (name, description, image_url, min_score, max_score, abv, sweetness, location_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Royal Siam Smoked Teak Old Fashioned',
       'Deep, powerful, and majestic. Crafted with rare aged spirits smoked over teakwood embers and spiced with wild cinnamon. An unapologetically bold creation reserved for leaders who appreciate unmatched complexity and heritage.',
       '/images/drinks/smoked-teak.png',
       5, 15,
       5,   // abv: bold, full-bodied spirit strength
       1,   // sweetness: dry, rich, and aromatic
       1]   // location_id: Garden of Siam — The Grand Teak Lounge
    );
    console.log('🍹  Seeded 3 Luxury Signature Cocktails with updated score bands.');
  } else {
    console.log('⏭   Drinks seed data already present.');
  }

  // Idempotent: check if GameStages already seeded
  const stagesExisting = await queryOne(db, 'SELECT COUNT(*) AS n FROM GameStages');
  if (forceReset || !stagesExisting || Number(stagesExisting.n) === 0) {
    if (forceReset) {
      await db.run('DELETE FROM Options');
      await db.run('DELETE FROM GameStages');
    }

    // ── Stage 1 – swipe (step_order: 1) • The Arrival (Lobby) ────────
    const s1Id = await runInsert(db,
      `INSERT INTO GameStages (step_order, story_text, game_type, background_image_url) VALUES (?, ?, ?, ?)`,
      [
        1,
        'ก้าวพ้นประตูรถลีมูซีนคันหรูสู่โถงล็อบบี้ไม้สักทองเพดานสูงแห่ง Garden of Siam... กลิ่นหอมละมุนของดอกมะลิตุ๊ดตู่และตะไคร้หอมออร์แกนิกอบอวลท่ามกลางเสียงดนตรีไทยประยุกต์และแจ๊ซคลอเบาๆ พนักงานต้อนรับ Concierge ค้อมศีรษะอย่างนอบน้อม พร้อมยื่นถาดบริการพิเศษระดับ V.I.P. เข้ามาให้คุณเลือกสัมผัสแรกเพื่อรีเฟรชจิตวิญญาณในค่ำคืนนี้...',
        'swipe',
        '/images/stages/stage1_lobby_bg.png'
      ]
    );

    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight, sub_question) VALUES (?, ?, ?, ?, ?)`,
      [s1Id, 'Cold Silk Towel (ผ้าเย็นผ้าไหมสกัดกลิ่นดอกมะลิสดชื่น ปลุกความกระปรี้กระเปร่าผ่อนคลาย)', '/images/options/cold-towel.png', -2, 'การต้อนรับระดับ V.I.P.: คุณต้องการสัมผัสแรกจาก Concierge แบบใด?']
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight, sub_question) VALUES (?, ?, ?, ?, ?)`,
      [s1Id, 'Warm Herbal Tea (ชาร้อนสมุนไพรตะไคร้หอมออร์แกนิก อบอุ่นลึกล้ำซึมซับความสงบ)', '/images/options/warm-tea.png', 2, 'การต้อนรับระดับ V.I.P.: คุณต้องการสัมผัสแรกจาก Concierge แบบใด?']
    );

    // ── Stage 2 – mixology (step_order: 2) • The Garden Promenade (The Journey) ──
    const s2Id = await runInsert(db,
      `INSERT INTO GameStages (step_order, story_text, game_type, background_image_url) VALUES (?, ?, ?, ?)`,
      [
        2,
        'คุณเดินทอดน่องผ่านสวนหย่อมเขตร้อนอันร่มรื่นภายใต้แสงจันทร์ (The Moonlit Courtyard) บึงบัวหลวงทอแสงประกายสีทองสะท้อนโคมไฟทองเหลืองโบราณที่แขวนตามกิ่งก้านของต้นไม้ใหญ่ บาร์เทนเดอร์ระดับมาสเตอร์นำ "ถ้วยเบญจรงค์ขอบทองคำ" มาให้คุณเลือกสรรดอกไม้และสมุนไพรหายากจากสวนแห่งนี้ เพื่อนำไปสกัดเป็น Bespoke Scent Base เครื่องดื่มแก้วพิเศษเฉพาะคุณเท่านั้น...',
        'mixology',
        '/images/stages/stage2_courtyard_bg.png'
      ]
    );

    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s2Id, 'ดอกกระดังงาโบราณ & เปลือกอบเชยป่า (Ancient Ylang-Ylang & Wild Cinnamon — หอมลึกล้ำเย้ายวน)', '/images/options/ylang-cinnamon.png', 3]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s2Id, 'ยอดชาขาวเขาใหญ่ & ดอกมะลิสกัดเย็น (Silver Needle Tea & Cold-Pressed Jasmine — บริสุทธิ์นุ่มนวล)', '/images/options/white-tea-jasmine.png', -1]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s2Id, 'กระวานเขียวจันทบุรี & น้ำผึ้งป่าเดือนห้า (Green Cardamom & Wild Honey — อบอุ่นซับซ้อนมีมิติ)', '/images/options/cardamom-honey.png', 2]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s2Id, 'ใบเตยหอมสุโขทัย & ผิวมะกรูดสกัดเย็น (Siamese Pandan & Kaffir Lime Zest — สดชื่นกระปรี้กระเปร่า)', '/images/options/pandan-lime.png', -2]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s2Id, 'กลีบบัวหลวงปทุม & น้ำค้างเกสรทองคำ (Royal Pink Lotus & Golden Pollen Dew — หอมหวานละเมียดละไม)', '/images/options/royal-lotus.png', 1]
    );

    // ── Stage 3 – tarot (step_order: 3) • The Hidden Sanctu-Bar (The Destination) ──
    const s3Id = await runInsert(db,
      `INSERT INTO GameStages (step_order, story_text, game_type, background_image_url) VALUES (?, ?, ?, ?)`,
      [
        3,
        'เมื่อเดินลัดเลาะมาสุดปลายสวนมรกต คุณจะพบกับบานประตูไม้สักโบราณแกะสลักลวดลายไทยสุดประณีตขนาดใหญ่ (The Hidden Sanctu-Bar) เสียงดนตรีแจ๊ซนุ่มๆ ลอยรอดออกมาผ่านช่องประตู บนโต๊ะหินอ่อนสีดำสนิท มีถาดกำมะหยี่สีเขียวมรกตวาง "กุญแจทองเหลืองโบราณ 3 ดอก" (Vintage Brass Keys) เพื่อให้คุณเลือกไขเข้าสู่โซนลับและปลดล็อก Signature Cocktail ประจำดวงชะตาของค่ำคืนนี้... เลือกกุญแจของคุณได้เลย!',
        'tarot',
        '/images/stages/stage3_door_bg.png'
      ]
    );

    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s3Id, 'The Emerald Sanctuary Key (กุญแจมรกตแห่งวิหารลับ — ปลดล็อกเครื่องดื่มรสเข้มข้น ดุดัน ทรงพลัง และลึกล้ำที่สุดแห่ง Garden of Siam)', '/images/options/key-emerald.png', 4]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s3Id, 'The Golden Lotus Key (กุญแจปทุมทองคำ — ปลดล็อกเครื่องดื่มรสหอมหวาน ละเมียดละไม นุ่มนวลและมีเสน่ห์ดั่งบุษบา)', '/images/options/key-lotus.png', -3]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s3Id, 'The Moonlight Courtyard Key (กุญแจจันทราศาลาไทย — ปลดล็อกเครื่องดื่มรสสดชื่น ซาบซ่า ท้าทายและคาดเดาไม่ได้)', '/images/options/key-moonlight.png', 1]
    );

    console.log('✅  Luxury Garden of Siam 5-Star Hotel Bar storyline seeded (3 Stages, 10 Options).');
  } else {
    console.log('⏭   GameStages already seeded.');
  }
}

async function checkAndSeedData(db, forceReset = false) {
  await createSchema(db);
  await seedData(db, forceReset);
}

// ─── Entry point ──────────────────────────────────────────────────────────────
async function main() {
  const forceReset = process.argv.includes('--reset') || process.argv.includes('--force');
  await initDb();
  const db = getDb();
  if (forceReset) {
    console.log('💥 Reset flag (--reset) detected: cleaning tables before seeding actual data...');
    await db.run('DROP TABLE IF EXISTS Options');
    await db.run('DROP TABLE IF EXISTS GameStages');
    await db.run('DROP TABLE IF EXISTS Drinks');
    await db.run('DROP TABLE IF EXISTS Locations');
  }
  await checkAndSeedData(db, forceReset);
  saveDb();   // Persist the in-memory state if needed (no-op for libSQL)
  console.log('🎉  Database initialisation complete.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('❌  Initialisation failed:', err.message);
    process.exit(1);
  });
}

module.exports = { checkAndSeedData, createSchema, seedData };
