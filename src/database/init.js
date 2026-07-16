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
      score_weight INTEGER NOT NULL DEFAULT 0
    )
  `);

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
      [1, 'Teens of Thailand', '76 Soi Nana, Charoen Krung Rd, Pom Prap, Bangkok 10100', 13.7388, 100.5144, 'https://maps.app.goo.gl/TeensOfThailandBangkok']
    );

    await db.run(
      `INSERT INTO Locations (id, name, address, latitude, longitude, google_maps_link)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [2, 'Tropic City', '672/65 Soi Charoen Krung 28, Bang Rak, Bangkok 10500', 13.7287, 100.5165, 'https://maps.app.goo.gl/TropicCityBangkok']
    );

    await db.run(
      `INSERT INTO Locations (id, name, address, latitude, longitude, google_maps_link)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [3, 'Nana Cyber Speakeasy', 'Soi Nana (Sukhumvit Soi 4/11), Khlong Toei, Bangkok 10110', 13.7405, 100.5532, 'https://maps.app.goo.gl/NanaCyberSpeakeasyBangkok']
    );
    console.log('📍  Seeded 3 Locations in Bangkok.');
  }

  // Idempotent: check if Drinks already seeded
  const drinksExisting = await queryOne(db, 'SELECT COUNT(*) AS n FROM Drinks');
  if (forceReset || !drinksExisting || Number(drinksExisting.n) === 0) {
    if (forceReset) await db.run('DELETE FROM Drinks');
    await db.run(
      `INSERT INTO Drinks (name, description, image_url, min_score, max_score, abv, sweetness, location_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Sparkling Water',
       'Pure, crisp, and effortlessly calm. You find beauty in simplicity and prefer life without the noise.',
       '/images/drinks/sparkling-water.png',
       -15, -1,
       1,   // abv: barely any kick — clean and pure
       2,   // sweetness: lightly refreshing
       2]   // location_id: Tropic City
    );

    await db.run(
      `INSERT INTO Drinks (name, description, image_url, min_score, max_score, abv, sweetness, location_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Tropical Smoothie',
       'Bold, colourful, and full of life. You thrive on new experiences and bring sunshine wherever you go.',
       '/images/drinks/tropical-smoothie.png',
       0, 4,
       2,   // abv: light fruity kick
       5,   // sweetness: maximum tropical sweetness
       3]   // location_id: Nana Cyber Speakeasy
    );

    await db.run(
      `INSERT INTO Drinks (name, description, image_url, min_score, max_score, abv, sweetness, location_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Dark Espresso',
       'Intense, focused, and unapologetically ambitious. You move fast, think deep, and never settle.',
       '/images/drinks/dark-espresso.png',
       5, 15,
       4,   // abv: strong bitter kick
       1,   // sweetness: barely sweet — pure intensity
       1]   // location_id: Teens of Thailand
    );
    console.log('🍹  Seeded 3 Spirit Drinks with updated score bands.');
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

    // ── Stage 1 – swipe (step_order: 1) • Suvarnabhumi Airport ───────────────────
    const s1Id = await runInsert(db,
      `INSERT INTO GameStages (step_order, story_text, game_type, background_image_url) VALUES (?, ?, ?, ?)`,
      [
        1,
        'ก้าวแรกแตะรันเวย์ BKK... นีออนไซเบอร์พังก์สาดแสงเข้าตา Welcome to the concrete jungle ที่ไม่เคยหลับใหล! คืนนี้จะเปิดบิลแบบ Chillout หรือพุ่งสุดเพดานแบบ Hardcore Party? ปัดการ์ดเลือก Vibe ของคุณเดี๋ยวนี้!',
        'swipe',
        '/images/stages/morning-bangkok.png'
      ]
    );

    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s1Id, 'ซึมซับบรรยากาศ จิบ Cocktail เบา ๆ รับลมกรุงเทพฯ', '/images/options/chill-cocktail.png', -2]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s1Id, 'ลุยแหลกทะลุปรอท! คืนนี้ยันเช้าไม่เมาไม่กลับ!', '/images/options/party-shot.png', 2]
    );

    // ── Stage 2 – mixology (step_order: 2) • Sukhumvit Expressway ───────────────
    const s2Id = await runInsert(db,
      `INSERT INTO GameStages (step_order, story_text, game_type, background_image_url) VALUES (?, ?, ?, ?)`,
      [
        2,
        'รถติดวินาศสันตะโรแต่จังหวะหัวใจเราบีตเร็วกว่า! ขยับขึ้น BTS มุ่งหน้าสู่โซนลับแห่งสุขุมวิท ก่อนถึงบาร์ลับ ต้องปรุงเครื่องดื่มฉบับ Street Alchemist ในถุงพลาสติกนีออน โยนวัตถุดิบลงไปให้เข้าเส้น!',
        'mixology',
        '/images/stages/sukhumvit-bts.png'
      ]
    );

    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s2Id, 'ใบกะเพรากรอบ & พริกขี้หนูไฟ (Spicy & Bold)', '/images/options/spicy-basil.png', 3]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s2Id, 'น้ำมะพร้าวน้ำหอมคั้นสด (Sweet & Refreshing)', '/images/options/fresh-coconut.png', -1]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s2Id, 'เหล้ารัมหมักเครื่องเทศไทยโบราณ (Herbal & Heavy)', '/images/options/spiced-rum.png', 2]
    );

    // ── Stage 3 – tarot (step_order: 3) • Nana Speakeasy Gate ───────────────────
    const s3Id = await runInsert(db,
      `INSERT INTO GameStages (step_order, story_text, game_type, background_image_url) VALUES (?, ?, ?, ?)`,
      [
        3,
        'ในที่สุดก็ลัดเลาะมาถึงตรอกลับย่าน Nana... หลังตู้หยอดเหรียญเก่ากึ๊กคือประตูสู่บาร์ลับที่กุมความลับของค่ำคืนนี้! แม่หมอไซเบอร์รอเปิดไพ่ยิปซีลึกล้ำ 3 ใบ ดวงชะตาของคุณจะพาไปปะทะกับ Spirit Drink แก้วไหน ดึงไพ่เปิดคำทำนายเลย!',
        'tarot',
        '/images/stages/nana-speakeasy.png'
      ]
    );

    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s3Id, 'ไพ่ The Neon Garuda (ครุฑสายฟ้า — แก้วเข้มข้น ดุดัน ทรงพลัง)', '/images/options/tarot-garuda.png', 4]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s3Id, 'ไพ่ The Cyber Kinnaree (กินรีไซเบอร์ — แก้วหอมหวาน เย้ายวน มีเสน่ห์)', '/images/options/tarot-kinnaree.png', -3]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s3Id, 'ไพ่ The Street Hanuman (หนุมานลุยไฟ — แก้วเปรี้ยวซ่า ท้าทาย คาดเดาไม่ได้)', '/images/options/tarot-hanuman.png', 1]
    );

    console.log('✅  Actual data seeded according to cms_3stage_journey_design.md (3 Stages, 8 Options).');
  } else {
    console.log('⏭   GameStages already seeded.');
  }
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
  await createSchema(db);
  await seedData(db, forceReset);
  saveDb();   // Persist the in-memory state if needed (no-op for libSQL)
  console.log('🎉  Database initialisation complete.');
}

main().catch((err) => {
  console.error('❌  Initialisation failed:', err.message);
  process.exit(1);
});
