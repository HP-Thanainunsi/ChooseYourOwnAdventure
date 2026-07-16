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

    // ── Stage 1 – swipe (step_order: 1) • Airport to City (BKK Arrival) ────────
    const s1Id = await runInsert(db,
      `INSERT INTO GameStages (step_order, story_text, game_type, background_image_url) VALUES (?, ?, ?, ?)`,
      [
        1,
        'ก้าวพ้นประตูสุวรรณภูมิ... ไอกรุ่นความชื้นของกรุงเทพฯ ปะทะหน้าทันที พื้นถนนยางมะตอยเปียกฝนสะท้อนแสงนีออนสีชมพูส้ม กลิ่นหมูปิ้งเตาถ่านหอมกระแทกใจลอยผสมควันท่อไอเสีย — Welcome to Bangkok, city of sleepless angels. คืนนี้คุณคือตัวเอกในฟิล์ม Wong Kar-wai ฉบับสยาม... จะเปิดฉากจังหวะ Chillout ซึมซับ Vibe เมือง หรือกระโจนลงสนาม Hardcore Nightlife สุดเพดาน? ปัดการ์ดเลือกเส้นทาง แล้วกระโดดขึ้นพาหนะสู่ใจกลางเมืองเดี๋ยวนี้!',
        'swipe',
        '/images/stages/morning-bangkok.png'
      ]
    );

    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight, sub_question) VALUES (?, ?, ?, ?, ?)`,
      [s1Id, 'เอนหลังบน Taxi เปิดกระจกรับลม จิบ Vibe ซึมซับแสงไฟกรุงเทพฯ แบบนุ่มลึก', '/images/options/chill-cocktail.png', -2, 'คำถามที่ 1: จังหวะแรกที่แตะรันเวย์สยาม จะเลือกเดินทางเข้าเมืองแบบไหน?']
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight, sub_question) VALUES (?, ?, ?, ?, ?)`,
      [s1Id, 'ซ้อนพี่วินทะลวงดงรถติด! เบิ้ลเครื่องกระโจนเข้าสู่ความวุ่นวายยามค่ำคืนแบบ Hardcore!', '/images/options/party-shot.png', 2, 'คำถามที่ 1: จังหวะแรกที่แตะรันเวย์สยาม จะเลือกเดินทางเข้าเมืองแบบไหน?']
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight, sub_question) VALUES (?, ?, ?, ?, ?)`,
      [s1Id, 'แวะหลบฝนในคาเฟ่ลับข้างทาง สั่งเครื่องดื่มอุ่นๆ ซึมซับเสียงฝนกระทบหลังคา', '/images/options/chill-cocktail.png', -1, 'คำถามที่ 2: ฝนตกลงมาเทกระหน่ำกะทันหันกลางทาง... คุณจะรับมือกับสถานการณ์นี้ยังไง?']
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight, sub_question) VALUES (?, ?, ?, ?, ?)`,
      [s1Id, 'ลุยต่อไม่สนฝน! ยิ่งฝนตกยิ่งสนุก ท้าทายความเปียกปอนสไตล์ Bangkok Night!', '/images/options/party-shot.png', 3, 'คำถามที่ 2: ฝนตกลงมาเทกระหน่ำกะทันหันกลางทาง... คุณจะรับมือกับสถานการณ์นี้ยังไง?']
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight, sub_question) VALUES (?, ?, ?, ?, ?)`,
      [s1Id, 'เดินชิลสำรวจบรรยากาศรอบๆ สังเกตผู้คนและแสงสีอย่างสงบ', '/images/options/chill-cocktail.png', 0, 'คำถามที่ 3: ก่อนถึงจุดหมาย เสียงเพลงลอยมาจากร้านสตรีทบาร์เปิดใหม่ คุณจะทำยังไง?']
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight, sub_question) VALUES (?, ?, ?, ?, ?)`,
      [s1Id, 'พุ่งตรงเข้าไปโยกตามจังหวะบีต ทักทายคนแปลกหน้าและเปิดรับมิตรภาพใหม่!', '/images/options/party-shot.png', 2, 'คำถามที่ 3: ก่อนถึงจุดหมาย เสียงเพลงลอยมาจากร้านสตรีทบาร์เปิดใหม่ คุณจะทำยังไง?']
    );

    // ── Stage 2 – mixology (step_order: 2) • The Traffic/Ride (Sukhumvit Gridlock) ──
    const s2Id = await runInsert(db,
      `INSERT INTO GameStages (step_order, story_text, game_type, background_image_url) VALUES (?, ?, ?, ?)`,
      [
        2,
        'เสียงท่อมอเตอร์ไซค์กระหึ่มครางสลับเสียงแตรในดงรถติดวินาศสันตะโรบนเส้นสุขุมวิท! เหนือหัวคือสายไฟดำขลับพันกันระโยงระยศราวกับงานศิลปะร่วมสมัย สะท้อนป้ายคาราโอเกะสไตล์ยุค 90s สีแดงสดแวววับ ระหว่างที่พาหนะของคุณลัดเลาะฝ่าดงไฟท้ายสีแดงเถือก ร่างกายเรียกร้องให้เติมเชื้อเพลิงก่อนถึงปลายทาง... มาปรุงเครื่องดื่ม Street Alchemist ในถุงก๊อบแก๊บนีออน โยนวัตถุดิบลับแห่งถนนสายนี้ลงไปผสมให้เข้าเส้นเลือด!',
        'mixology',
        '/images/stages/sukhumvit-bts.png'
      ]
    );

    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s2Id, 'ใบกะเพรากรอบเผ็ดร้อน & พริกขี้หนูไฟจี๊ดจ๊าด (Spicy & Bold Street Heat)', '/images/options/spicy-basil.png', 3]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s2Id, 'น้ำมะพร้าวน้ำหอมคั้นสดเย็นเจี๊ยบจากร้านริมทาง (Sweet & Refreshing Siam Cool)', '/images/options/fresh-coconut.png', -1]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s2Id, 'เหล้ารัมหมักสมุนไพรไทยโบราณเข้มข้น (Herbal & Heavy Alchemist Spirit)', '/images/options/spiced-rum.png', 2]
    );

    // ── Stage 3 – tarot (step_order: 3) • Walking into Nana Alley Speakeasy Gate ──
    const s3Id = await runInsert(db,
      `INSERT INTO GameStages (step_order, story_text, game_type, background_image_url) VALUES (?, ?, ?, ?)`,
      [
        3,
        'พาหนะจอดสนิทหน้าปากตรอกลับซอยนานา... เสียงเบสหนักแน่นสั่นสะเทือนผ่านกำแพงตึกแถวจีนโบราณ กลิ่นฝนตกใหม่บนหินแกรนิตผสมกลิ่นควันธูปบางเบาลอยแตะจมูก คุณเดินลัดเลาะผ่านป้ายไฟภาษาจีนและไทยกะพริบไหว จนถึงหน้าประตูบาร์ลับที่ซ่อนอยู่หลังตู้หยอดเหรียญวินเทจ! แม่หมอไซเบอร์นั่งรออยู่ใต้แสงไฟสีแดงชาด พร้อมไพ่ยิปซีลึกล้ำ 3 ใบที่เปิดเผยจุดหมายและเครื่องดื่มแห่งดวงชะตาของค่ำคืนนี้... ดึงไพ่เปิดคำทำนายเลย!',
        'tarot',
        '/images/stages/nana-speakeasy.png'
      ]
    );

    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s3Id, 'ไพ่ The Neon Garuda (ครุฑสายฟ้า — แก้วเข้มข้น ดุดัน ทรงพลังแห่งค่ำคืน)', '/images/options/tarot-garuda.png', 4]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s3Id, 'ไพ่ The Cyber Naga (นาคาเรืองแสง — แก้วลึกล้ำ ลึกลับ เย้ายวนชวนหลงใหล)', '/images/options/tarot-kinnaree.png', -3]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight) VALUES (?, ?, ?, ?)`,
      [s3Id, 'ไพ่ The Street Hanuman (หนุมานลุยไฟ — แก้วเปรี้ยวซ่า ท้าทาย คาดเดาไม่ได้)', '/images/options/tarot-hanuman.png', 1]
    );

    console.log('✅  Cinematic Wong Kar-wai & Thai Street Culture storyline seeded (3 Stages, 8 Options).');
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
