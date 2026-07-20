'use strict';

const { initDb, getDb, saveDb, runInsert, queryOne, queryAll } = require('./db');

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
      name_en          TEXT,
      address          TEXT    NOT NULL,
      address_en       TEXT,
      latitude         REAL    NOT NULL,
      longitude        REAL    NOT NULL,
      google_maps_link TEXT    NOT NULL,
      image_url        TEXT
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS Attractions (
      id          TEXT PRIMARY KEY,
      title_th    TEXT NOT NULL,
      title_en    TEXT NOT NULL,
      subtitle_th TEXT NOT NULL,
      subtitle_en TEXT NOT NULL,
      image_url   TEXT NOT NULL,
      tag_th      TEXT NOT NULL,
      tag_en      TEXT NOT NULL
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS Drinks (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT    NOT NULL UNIQUE,
      name_en        TEXT,
      description    TEXT    NOT NULL,
      description_en TEXT,
      image_url      TEXT,
      min_score      INTEGER NOT NULL,
      max_score      INTEGER NOT NULL,
      abv            INTEGER NOT NULL DEFAULT 1 CHECK(abv BETWEEN 1 AND 5),
      sweetness      INTEGER NOT NULL DEFAULT 1 CHECK(sweetness BETWEEN 1 AND 5),
      location_id    INTEGER REFERENCES Locations(id),
      CHECK (min_score <= max_score)
    )
  `);

  // Ensure location_id and bilingual columns exist for pre-existing databases
  try { await db.run(`ALTER TABLE Drinks ADD COLUMN location_id INTEGER REFERENCES Locations(id)`); } catch (_e) {}
  try { await db.run(`ALTER TABLE Drinks ADD COLUMN name_en TEXT`); } catch (_e) {}
  try { await db.run(`ALTER TABLE Drinks ADD COLUMN description_en TEXT`); } catch (_e) {}
  try { await db.run(`ALTER TABLE Locations ADD COLUMN name_en TEXT`); } catch (_e) {}
  try { await db.run(`ALTER TABLE Locations ADD COLUMN address_en TEXT`); } catch (_e) {}
  try { await db.run(`ALTER TABLE Locations ADD COLUMN image_url TEXT`); } catch (_e) {}

  // ─── GameStages (formerly Questions) ────────────────────────────────────────
  await db.run(`
    CREATE TABLE IF NOT EXISTS GameStages (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      step_order           INTEGER NOT NULL UNIQUE,
      story_text           TEXT    NOT NULL,
      story_text_en        TEXT,
      game_type            TEXT    NOT NULL CHECK(game_type IN ('swipe','mixology','tarot','drag_drop')),
      background_image_url TEXT
    )
  `);

  try { await db.run(`ALTER TABLE GameStages ADD COLUMN story_text_en TEXT`); } catch (_e) {}

  // ─── Options (now references GameStages via stage_id) ───────────────────────
  await db.run(`
    CREATE TABLE IF NOT EXISTS Options (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      stage_id        INTEGER NOT NULL REFERENCES GameStages(id) ON DELETE CASCADE,
      label           TEXT    NOT NULL,
      label_en        TEXT,
      image_url       TEXT,
      score_weight    INTEGER NOT NULL DEFAULT 0,
      sub_question    TEXT,
      sub_question_en TEXT
    )
  `);

  try { await db.run(`ALTER TABLE Options ADD COLUMN sub_question TEXT`); } catch (_e) {}
  try { await db.run(`ALTER TABLE Options ADD COLUMN label_en TEXT`); } catch (_e) {}
  try { await db.run(`ALTER TABLE Options ADD COLUMN sub_question_en TEXT`); } catch (_e) {}

  console.log('✅  Schema created (GameStages & Options verified with bilingual columns).');
}

// ─── DML (seed) ───────────────────────────────────────────────────────────────
async function seedData(db, forceReset = false) {
  if (forceReset) {
    try { await db.run('DELETE FROM Options'); } catch (_e) {}
    try { await db.run('DELETE FROM GameStages'); } catch (_e) {}
    try { await db.run('DELETE FROM Drinks'); } catch (_e) {}
    try { await db.run('DELETE FROM Locations'); } catch (_e) {}
  }

  // Check & Seed Locations
  const locExisting = await queryOne(db, 'SELECT COUNT(*) AS n FROM Locations');
  if (forceReset || !locExisting || Number(locExisting.n) === 0) {
    await db.run(
      `INSERT INTO Locations (id, name, name_en, address, address_en, latitude, longitude, google_maps_link, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1,
        'Garden of Siam — The Grand Teak Lounge',
        'Garden of Siam — The Grand Teak Lounge',
        '48 Oriental Avenue, Bang Rak, กรุงเทพมหานคร 10500',
        '48 Oriental Avenue, Bang Rak, Bangkok 10500',
        13.7240, 100.5140, 'https://maps.app.goo.gl/MandarinOrientalBangkok',
        '/images/stages/garden-of-siam.png'
      ]
    );

    await db.run(
      `INSERT INTO Locations (id, name, name_en, address, address_en, latitude, longitude, google_maps_link, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        2,
        'The Sanctuary Speakeasy at Garden of Siam',
        'The Sanctuary Speakeasy at Garden of Siam',
        'ซอยนายเลิศ ถนนวิทยุ แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330',
        'Soi Nai Lert, Wireless Road, Pathum Wan, Bangkok 10330',
        13.7432, 100.5475, 'https://maps.app.goo.gl/SanctuarySpeakeasyBangkok',
        '/images/stages/stage2_courtyard_bg.png'
      ]
    );

    await db.run(
      `INSERT INTO Locations (id, name, name_en, address, address_en, latitude, longitude, google_maps_link, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        3,
        'The Moonlight Promenade Bar',
        'The Moonlight Promenade Bar',
        '152 ถนนวิทยุ แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330',
        '152 Wireless Rd, Lumphini, Pathum Wan, Bangkok 10330',
        13.7360, 100.5478, 'https://maps.app.goo.gl/MoonlightPromenadeBangkok',
        '/images/stages/stage1_lobby_bg.png'
      ]
    );
    console.log('📍  Seeded 3 Luxury Hotel Bar Locations with Bilingual support.');
  } else {
    try {
      await db.run(
        `UPDATE Locations SET name = ?, name_en = ?, address = ?, address_en = ?, google_maps_link = ?, image_url = ? WHERE id = 1`,
        [
          'Garden of Siam — The Grand Teak Lounge',
          'Garden of Siam — The Grand Teak Lounge',
          '48 Oriental Avenue, Bang Rak, กรุงเทพมหานคร 10500',
          '48 Oriental Avenue, Bang Rak, Bangkok 10500',
          'https://maps.app.goo.gl/MandarinOrientalBangkok',
          '/images/stages/garden-of-siam.png'
        ]
      );
      await db.run(
        `UPDATE Locations SET name = ?, name_en = ?, address = ?, address_en = ?, google_maps_link = ?, image_url = ? WHERE id = 2`,
        [
          'The Sanctuary Speakeasy at Garden of Siam',
          'The Sanctuary Speakeasy at Garden of Siam',
          'ซอยนายเลิศ ถนนวิทยุ แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330',
          'Soi Nai Lert, Wireless Road, Pathum Wan, Bangkok 10330',
          'https://maps.app.goo.gl/SanctuarySpeakeasyBangkok',
          '/images/stages/stage2_courtyard_bg.png'
        ]
      );
      await db.run(
        `UPDATE Locations SET name = ?, name_en = ?, address = ?, address_en = ?, google_maps_link = ?, image_url = ? WHERE id = 3`,
        [
          'The Moonlight Promenade Bar',
          'The Moonlight Promenade Bar',
          '152 ถนนวิทยุ แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330',
          '152 Wireless Rd, Lumphini, Pathum Wan, Bangkok 10330',
          'https://maps.app.goo.gl/MoonlightPromenadeBangkok',
          '/images/stages/stage1_lobby_bg.png'
        ]
      );
      console.log('📍  Synced & updated 3 Luxury Hotel Bar Locations on TURSO.');
    } catch (_e) {}
  }

  // Always UPSERT Attractions (`Garden of Siam` & Bangkok Landmarks) onto TURSO
  await db.run(
    `INSERT OR REPLACE INTO Attractions (id, title_th, title_en, subtitle_th, subtitle_en, image_url, tag_th, tag_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'grand-palace',
      'พระบรมมหาราชวัง & วัดพระศรีรัตนศาสดาราม',
      'Grand Palace & Wat Phra Kaew',
      'มรดกความงามคู่บ้านคู่เมือง สถาปัตยกรรมไทยชั้นยอดที่ส่องประกายสีทองอร่าม',
      'The sacred heart of Siam, showcasing majestic golden spires and exquisite royal architecture.',
      '/images/stages/morning-bangkok.png',
      'ประวัติศาสตร์ & ศิลปะชั้นสูง',
      'ROYAL HERITAGE'
    ]
  );
  await db.run(
    `INSERT OR REPLACE INTO Attractions (id, title_th, title_en, subtitle_th, subtitle_en, image_url, tag_th, tag_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'wat-arun',
      'วัดอรุณราชวราราม ยามอัสดงริมเจ้าพระยา',
      'Wat Arun · Temple of Dawn Reflections',
      'พระปรางค์ประดับกระเบื้องเคลือบเบญจรงค์ สัญลักษณ์แห่งความงามเหนือกาลเวลาฝั่งธนบุรี',
      'Iconic porcelain-encrusted prang standing gracefully by the Chao Phraya River at twilight.',
      '/images/stages/nana-speakeasy.png',
      'สถาปัตยกรรมริมน้ำ',
      'ICONIC LANDMARK'
    ]
  );
  await db.run(
    `INSERT OR REPLACE INTO Attractions (id, title_th, title_en, subtitle_th, subtitle_en, image_url, tag_th, tag_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'mahanakhon-skybar',
      'มหานครสกายบาร์ & แสงสียามราตรี',
      'Mahanakhon SkyBar & Modern Skyline',
      'จุดชมวิวระดับท็อป 360 องศา สัมผัสมนต์เสน่ห์แห่งมหานครที่ไม่เคยหลับใหล',
      'Bangkok’s architectural pinnacle offering panoramic rooftop cocktails above the glittering clouds.',
      '/images/stages/sukhumvit-bts.png',
      'ไลฟ์สไตล์เหนือระดับ',
      'ROOFTOP LUXURY'
    ]
  );
  await db.run(
    `INSERT OR REPLACE INTO Attractions (id, title_th, title_en, subtitle_th, subtitle_en, image_url, tag_th, tag_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'garden-of-siam',
      'สวนสวรรค์พฤกษาแห่งสยาม & บาร์ลับห้าดาว',
      'Garden of Siam · 5-Star Speakeasy Bar',
      'โอเอซิสส่วนตัวใจกลางเมือง รังสรรค์เครื่องดื่มเฉพาะบุคคลจากเอสเซนส์สมุนไพรไทยโบราณ',
      'An intimate botanical sanctuary crafting personalized alchemy from rare Thai herbs & royal elixirs.',
      '/images/stages/garden-of-siam.png',
      'ประสบการณ์ค็อกเทลลับ',
      'SIGNATURE SANCTUARY'
    ]
  );
  console.log('🏛️  Synced & Seeded 4 Bangkok & Garden of Siam Attractions onto TURSO.');

  // Idempotent: check if Drinks already seeded or sync them
  const drinksExisting = await queryOne(db, 'SELECT COUNT(*) AS n FROM Drinks');
  if (forceReset || !drinksExisting || Number(drinksExisting.n) === 0) {
    if (forceReset) await db.run('DELETE FROM Drinks');
    await db.run(
      `INSERT INTO Drinks (id, name, name_en, description, description_en, image_url, min_score, max_score, abv, sweetness, location_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1,
        'Flawless Crystal Coupe Cocktail',
        'Flawless Crystal Coupe Cocktail',
        'ค็อกเทลคริสตัลใสบริสุทธิ์สีทองอำพันในแก้วคูปหรูหรา ประดับแผ่นทองคำเปลวบริสุทธิ์และกล้วยไม้ขาวสะท้อนแสงไฟ รสชาติกลมกล่อมละเมียดละไม มอบความรู้สึกสงบนิ่งและมีระดับขั้นสุด',
        'A flawless, crystal-clear coupe glass filled with a premium signature cocktail, glowing slightly in amber tones. Garnished with a delicate edible gold leaf and a single floating white orchid. Exclusively designed for the refined soul seeking serenity and timeless elegance.',
        '/images/drinks/crystal-coupe.png',
        -15, -1,
        2,   // abv: smooth and refined
        4,   // sweetness: subtle honey and floral sweetness
        2    // location_id: The Sanctuary Speakeasy
      ]
    );

    await db.run(
      `INSERT INTO Drinks (id, name, name_en, description, description_en, image_url, min_score, max_score, abv, sweetness, location_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        2,
        'Moonlight Botanical Fizz',
        'Moonlight Botanical Fizz',
        'เครื่องดื่มสปาร์คกลิ้งพฤกษาสูตรลับ ผสมผสานสมุนไพรราชสำนักและกลิ่นหอมของดอกมะลิตุ๊ดตู่สกัดเย็น ท็อปด้วยไอหมอกแชมเปญซาบซ่า เหมาะสำหรับจิตวิญญาณผู้รักความท้าทายและหลงใหลในความลึกลับของสวนเขตร้อนยามราตรี',
        'A vibrant and aromatic elixir infused with rare royal herbs and night-blooming jasmine, topped with effervescent champagne mist. Perfect for the adventurous spirit who delights in the mysteries of the tropical garden under moonlight.',
        '/images/drinks/botanical-fizz.png',
        0, 4,
        3,   // abv: delightful champagne fizz
        3,   // sweetness: balanced botanical sweetness
        3    // location_id: The Moonlight Promenade Bar
      ]
    );

    await db.run(
      `INSERT INTO Drinks (id, name, name_en, description, description_en, image_url, min_score, max_score, abv, sweetness, location_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        3,
        'Royal Siam Smoked Teak Old Fashioned',
        'Royal Siam Smoked Teak Old Fashioned',
        'ค็อกเทลทรงพลังและสง่างาม รมควันด้วยถ่านไม้สักทองโบราณและเปลือกอบเชยป่า ให้รสสัมผัสลึกล้ำ ดุดัน และทรงเสน่ห์ รังสรรค์ขึ้นเฉพาะสำหรับผู้นำผู้ชื่นชอบความซับซ้อนและเปี่ยมด้วยเอกลักษณ์เฉพาะตัว',
        'Deep, powerful, and majestic. Crafted with rare aged spirits smoked over teakwood embers and spiced with wild cinnamon. An unapologetically bold creation reserved for leaders who appreciate unmatched complexity and heritage.',
        '/images/drinks/smoked-teak.png',
        5, 15,
        5,   // abv: bold, full-bodied spirit strength
        1,   // sweetness: dry, rich, and aromatic
        1    // location_id: Garden of Siam — The Grand Teak Lounge
      ]
    );
    console.log('🍹  Seeded 3 Luxury Signature Cocktails with Bilingual text.');
  } else {
    try {
      await db.run(
        `UPDATE Drinks SET name = ?, name_en = ?, description = ?, description_en = ?, image_url = ?, location_id = ? WHERE id = 1`,
        [
          'Flawless Crystal Coupe Cocktail',
          'Flawless Crystal Coupe Cocktail',
          'ค็อกเทลคริสตัลใสบริสุทธิ์สีทองอำพันในแก้วคูปหรูหรา ประดับแผ่นทองคำเปลวบริสุทธิ์และกล้วยไม้ขาวสะท้อนแสงไฟ รสชาติกลมกล่อมละเมียดละไม มอบความรู้สึกสงบนิ่งและมีระดับขั้นสุด',
          'A flawless, crystal-clear coupe glass filled with a premium signature cocktail, glowing slightly in amber tones. Garnished with a delicate edible gold leaf and a single floating white orchid. Exclusively designed for the refined soul seeking serenity and timeless elegance.',
          '/images/drinks/crystal-coupe.png',
          2
        ]
      );
      await db.run(
        `UPDATE Drinks SET name = ?, name_en = ?, description = ?, description_en = ?, image_url = ?, location_id = ? WHERE id = 2`,
        [
          'Moonlight Botanical Fizz',
          'Moonlight Botanical Fizz',
          'เครื่องดื่มสปาร์คกลิ้งพฤกษาสูตรลับ ผสมผสานสมุนไพรราชสำนักและกลิ่นหอมของดอกมะลิตุ๊ดตู่สกัดเย็น ท็อปด้วยไอหมอกแชมเปญซาบซ่า เหมาะสำหรับจิตวิญญาณผู้รักความท้าทายและหลงใหลในความลึกลับของสวนเขตร้อนยามราตรี',
          'A vibrant and aromatic elixir infused with rare royal herbs and night-blooming jasmine, topped with effervescent champagne mist. Perfect for the adventurous spirit who delights in the mysteries of the tropical garden under moonlight.',
          '/images/drinks/botanical-fizz.png',
          3
        ]
      );
      await db.run(
        `UPDATE Drinks SET name = ?, name_en = ?, description = ?, description_en = ?, image_url = ?, location_id = ? WHERE id = 3`,
        [
          'Royal Siam Smoked Teak Old Fashioned',
          'Royal Siam Smoked Teak Old Fashioned',
          'ค็อกเทลทรงพลังและสง่างาม รมควันด้วยถ่านไม้สักทองโบราณและเปลือกอบเชยป่า ให้รสสัมผัสลึกล้ำ ดุดัน และทรงเสน่ห์ รังสรรค์ขึ้นเฉพาะสำหรับผู้นำผู้ชื่นชอบความซับซ้อนและเปี่ยมด้วยเอกลักษณ์เฉพาะตัว',
          'Deep, powerful, and majestic. Crafted with rare aged spirits smoked over teakwood embers and spiced with wild cinnamon. An unapologetically bold creation reserved for leaders who appreciate unmatched complexity and heritage.',
          '/images/drinks/smoked-teak.png',
          1
        ]
      );
      console.log('🍹  Synced & updated 3 Luxury Signature Cocktails on TURSO.');
    } catch (_e) {}
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
      `INSERT INTO GameStages (step_order, story_text, story_text_en, game_type, background_image_url) VALUES (?, ?, ?, ?, ?)`,
      [
        1,
        'ก้าวพ้นประตูรถลีมูซีนคันหรูสู่โถงล็อบบี้ไม้สักทองเพดานสูงแห่ง Garden of Siam... กลิ่นหอมละมุนของดอกมะลิตุ๊ดตู่และตะไคร้หอมออร์แกนิกอบอวลท่ามกลางเสียงดนตรีไทยประยุกต์และแจ๊ซคลอเบาๆ พนักงานต้อนรับ Concierge ค้อมศีรษะอย่างนอบน้อม พร้อมยื่นถาดบริการพิเศษระดับ V.I.P. เข้ามาให้คุณเลือกสัมผัสแรกเพื่อรีเฟรชจิตวิญญาณในค่ำคืนนี้...',
        'Step outside your luxury limousine into the soaring golden teakwood lobby of The Garden of Siam... The organic aroma of Siamese night jasmine and wild lemongrass fills the air alongside soft acoustic jazz. The Concierge bows gracefully, offering a silver-gold Benjarong tray for your welcome refreshing ritual tonight...',
        'swipe',
        '/images/stages/stage1_lobby_bg.png'
      ]
    );

    await db.run(
      `INSERT INTO Options (stage_id, label, label_en, image_url, score_weight, sub_question, sub_question_en) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        s1Id,
        'Cold Silk Towel (ผ้าเย็นผ้าไหมสกัดกลิ่นดอกมะลิสดชื่น ปลุกความกระปรี้กระเปร่าผ่อนคลาย)',
        'Cold Silk Towel (Chilled organic jasmine infusion silk towel — Revitalizing & Refreshing)',
        '/images/options/cold-towel.png', -2,
        'การต้อนรับระดับ V.I.P.: คุณต้องการสัมผัสแรกจาก Concierge แบบใด?',
        'V.I.P. Hospitality Ritual: Which first touch do you prefer from our Concierge?'
      ]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, label_en, image_url, score_weight, sub_question, sub_question_en) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        s1Id,
        'Warm Herbal Tea (ชาร้อนสมุนไพรตะไคร้หอมออร์แกนิก อบอุ่นลึกล้ำซึมซับความสงบ)',
        'Warm Herbal Tea (Steaming organic lemongrass and pandan herbal tea — Deeply Soothing)',
        '/images/options/warm-tea.png', 2,
        'การต้อนรับระดับ V.I.P.: คุณต้องการสัมผัสแรกจาก Concierge แบบใด?',
        'V.I.P. Hospitality Ritual: Which first touch do you prefer from our Concierge?'
      ]
    );

    // ── Stage 2 – mixology (step_order: 2) • The Garden Promenade (The Journey) ──
    const s2Id = await runInsert(db,
      `INSERT INTO GameStages (step_order, story_text, story_text_en, game_type, background_image_url) VALUES (?, ?, ?, ?, ?)`,
      [
        2,
        'คุณเดินทอดน่องผ่านสวนหย่อมเขตร้อนอันร่มรื่นภายใต้แสงจันทร์ (The Moonlit Courtyard) บึงบัวหลวงทอแสงประกายสีทองสะท้อนโคมไฟทองเหลืองโบราณที่แขวนตามกิ่งก้านของต้นไม้ใหญ่ บาร์เทนเดอร์ระดับมาสเตอร์นำ "ถ้วยเบญจรงค์ขอบทองคำ" มาให้คุณเลือกสรรดอกไม้และสมุนไพรหายากจากสวนแห่งนี้ เพื่อนำไปสกัดเป็น Bespoke Scent Base เครื่องดื่มแก้วพิเศษเฉพาะคุณเท่านั้น...',
        'You stroll through the moonlit tropical courtyard (The Moonlit Courtyard). The royal lotus pond reflects golden hues from antique brass lanterns suspended from banyan branches. Master mixologists present a golden-rimmed Benjarong crystal decanter for you to select rare botanicals, formulating your Bespoke Scent Base...',
        'mixology',
        '/images/stages/stage2_courtyard_bg.png'
      ]
    );

    await db.run(
      `INSERT INTO Options (stage_id, label, label_en, image_url, score_weight) VALUES (?, ?, ?, ?, ?)`,
      [s2Id, 'ดอกกระดังงาโบราณ & เปลือกอบเชยป่า (Ancient Ylang-Ylang & Wild Cinnamon — หอมลึกล้ำเย้ายวน)', 'Ancient Ylang-Ylang & Wild Cinnamon (Deep, sensual & woody botanical notes)', '/images/options/ylang-cinnamon.png', 3]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, label_en, image_url, score_weight) VALUES (?, ?, ?, ?, ?)`,
      [s2Id, 'ยอดชาขาวเขาใหญ่ & ดอกมะลิสกัดเย็น (Silver Needle Tea & Cold-Pressed Jasmine — บริสุทธิ์นุ่มนวล)', 'Silver Needle White Tea & Cold-Pressed Jasmine (Pure, refined & delicate floral notes)', '/images/options/white-tea-jasmine.png', -1]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, label_en, image_url, score_weight) VALUES (?, ?, ?, ?, ?)`,
      [s2Id, 'กระวานเขียวจันทบุรี & น้ำผึ้งป่าเดือนห้า (Green Cardamom & Wild Honey — อบอุ่นซับซ้อนมีมิติ)', 'Green Cardamom & Wild Honey (Warm, complex & layered sweet spice warmth)', '/images/options/cardamom-honey.png', 2]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, label_en, image_url, score_weight) VALUES (?, ?, ?, ?, ?)`,
      [s2Id, 'ใบเตยหอมสุโขทัย & ผิวมะกรูดสกัดเย็น (Siamese Pandan & Kaffir Lime Zest — สดชื่นกระปรี้กระเปร่า)', 'Siamese Pandan & Kaffir Lime Zest (Vibrant, tropical & refreshing citrus aroma)', '/images/options/pandan-lime.png', -2]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, label_en, image_url, score_weight) VALUES (?, ?, ?, ?, ?)`,
      [s2Id, 'กลีบบัวหลวงปทุม & น้ำค้างเกสรทองคำ (Royal Pink Lotus & Golden Pollen Dew — หอมหวานละเมียดละไม)', 'Royal Pink Lotus & Golden Pollen Dew (Ethereal, sweet & harmonious nectar)', '/images/options/royal-lotus.png', 1]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, label_en, image_url, score_weight) VALUES (?, ?, ?, ?, ?)`,
      [s2Id, 'ดอกอัญชันและตะไคร้หอม (Blue Butterfly Pea & Lemongrass — ลึกลับและสดชื่น)', 'Blue Butterfly Pea & Lemongrass (Mystical deep blue with refreshing zest)', '/images/options/butterfly-pea-lemongrass.png', 2]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, label_en, image_url, score_weight) VALUES (?, ?, ?, ?, ?)`,
      [s2Id, 'ขิงสดและโหระพาสยาม (Fresh Ginger & Siamese Basil — เผ็ดร้อนจัดจ้านทรงพลัง)', 'Fresh Ginger & Siamese Basil (Spicy, herbaceous, and intensely invigorating)', '/images/options/ginger-basil.png', 4]
    );

    // ── Stage 3 – tarot (step_order: 3) • The Hidden Sanctu-Bar (The Destination) ──
    const s3Id = await runInsert(db,
      `INSERT INTO GameStages (step_order, story_text, story_text_en, game_type, background_image_url) VALUES (?, ?, ?, ?, ?)`,
      [
        3,
        'เมื่อเดินลัดเลาะมาสุดปลายสวนมรกต คุณจะพบกับบานประตูไม้สักโบราณแกะสลักลวดลายไทยสุดประณีตขนาดใหญ่ (The Hidden Sanctu-Bar) เสียงดนตรีแจ๊ซนุ่มๆ ลอยรอดออกมาผ่านช่องประตู บนโต๊ะหินอ่อนสีดำสนิท มีถาดกำมะหยี่สีเขียวมรกตวาง "กุญแจทองเหลืองโบราณ 3 ดอก" (Vintage Brass Keys) เพื่อให้คุณเลือกไขเข้าสู่โซนลับและปลดล็อก Signature Cocktail ประจำดวงชะตาของค่ำคืนนี้... เลือกกุญแจของคุณได้เลย!',
        'At the far end of the emerald garden stands a majestic carved antique teakwood door (The Hidden Sanctu-Bar). Soft acoustic jazz drifts through the brass keyhole. On a polished black marble table rests a velvet tray displaying three Vintage Brass Keys to unlock your sanctuary signature cocktail... Choose your sacred key!',
        'tarot',
        '/images/stages/stage3_tarot_bg.png'
      ]
    );

    await db.run(
      `INSERT INTO Options (stage_id, label, label_en, image_url, score_weight) VALUES (?, ?, ?, ?, ?)`,
      [
        s3Id,
        'The Emerald Sanctuary Key (กุญแจมรกตแห่งวิหารลับ — ปลดล็อกเครื่องดื่มรสเข้มข้น ดุดัน ทรงพลัง และลึกล้ำที่สุดแห่ง Garden of Siam)',
        'The Emerald Sanctuary Key (Unlocks the most intense, bold, and profound spirit in our hidden lounge)',
        '/images/options/key-emerald.png', 4
      ]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, label_en, image_url, score_weight) VALUES (?, ?, ?, ?, ?)`,
      [
        s3Id,
        'The Golden Lotus Key (กุญแจปทุมทองคำ — ปลดล็อกเครื่องดื่มรสหอมหวาน ละเมียดละไม นุ่มนวลและมีเสน่ห์ดั่งบุษบา)',
        'The Golden Lotus Key (Unlocks a smooth, honeyed, and enchantingly delicate floral signature cocktail)',
        '/images/options/key-lotus.png', -3
      ]
    );
    await db.run(
      `INSERT INTO Options (stage_id, label, label_en, image_url, score_weight) VALUES (?, ?, ?, ?, ?)`,
      [
        s3Id,
        'The Moonlight Courtyard Key (กุญแจจันทราศาลาไทย — ปลดล็อกเครื่องดื่มรสสดชื่น ซาบซ่า ท้าทายและคาดเดาไม่ได้)',
        'The Moonlight Courtyard Key (Unlocks a vibrant, sparkling, and adventurous tropical botanical elixir)',
        '/images/options/key-moonlight.png', 1
      ]
    );

    console.log('✅  Luxury Garden of Siam 5-Star Hotel Bar storyline seeded with Bilingual text.');
  } else {
    try {
      await db.run(`UPDATE GameStages SET background_image_url = '/images/stages/stage1_lobby_bg.png' WHERE step_order = 1`);
      await db.run(`UPDATE GameStages SET background_image_url = '/images/stages/stage2_courtyard_bg.png' WHERE step_order = 2`);
      await db.run(`UPDATE GameStages SET background_image_url = '/images/stages/stage3_tarot_bg.png' WHERE step_order = 3`);
      console.log('🏛️  Synced 3 Luxury Garden of Siam background images to GameStages on TURSO.');
    } catch (_e) {}
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
  await checkAndSeedData(db, forceReset);
  saveDb();
  console.log('🗄   Database check & seed complete.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('❌  Fatal database initialization error:', err);
    process.exit(1);
  });
}

module.exports = {
  createSchema,
  seedData,
  checkAndSeedData,
};
