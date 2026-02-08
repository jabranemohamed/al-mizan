-- =====================================================
-- Al-Mizan: Balance of Deeds - Initial Schema
-- =====================================================

CREATE TABLE app_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE actions (
    id BIGSERIAL PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('GOOD', 'BAD')),
    weight INTEGER NOT NULL DEFAULT 1,
    category VARCHAR(100),
    icon VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE user_daily_actions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    action_id BIGINT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
    action_date DATE NOT NULL,
    checked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, action_id, action_date)
);

CREATE TABLE daily_balances (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    balance_date DATE NOT NULL,
    good_count INTEGER DEFAULT 0,
    bad_count INTEGER DEFAULT 0,
    good_weight INTEGER DEFAULT 0,
    bad_weight INTEGER DEFAULT 0,
    verdict VARCHAR(20),
    UNIQUE (user_id, balance_date)
);

-- Indexes
CREATE INDEX idx_user_daily_actions_date ON user_daily_actions(user_id, action_date);
CREATE INDEX idx_daily_balances_date ON daily_balances(user_id, balance_date);

-- =====================================================
-- Seed: Good Actions (حسنات)
-- =====================================================
INSERT INTO actions (name_ar, name_fr, name_en, type, weight, category, icon) VALUES
('الصلوات الخمس',      '5 Prières quotidiennes',    '5 Daily Prayers',        'GOOD', 3, 'WORSHIP',   '🕌'),
('قراءة القرآن',       'Lire le Coran',             'Read Quran',             'GOOD', 2, 'WORSHIP',   '📖'),
('الصدقة',             'Donner l''aumône',           'Give Charity',           'GOOD', 2, 'CHARITY',   '💝'),
('ذكر الله',           'Dhikr / Invocation',        'Remembrance of Allah',   'GOOD', 1, 'WORSHIP',   '📿'),
('بر الوالدين',        'Bonté envers les parents',  'Kindness to Parents',    'GOOD', 3, 'FAMILY',    '👨‍👩‍👧'),
('الصيام',             'Jeûner (surérogatoire)',     'Voluntary Fasting',      'GOOD', 2, 'WORSHIP',   '🌙'),
('صلة الرحم',          'Maintenir les liens',       'Family Ties',            'GOOD', 2, 'FAMILY',    '🤝'),
('الصبر',              'Patience',                  'Patience',               'GOOD', 1, 'CHARACTER', '🧘'),
('الصدق',              'Dire la vérité',            'Truthfulness',           'GOOD', 2, 'CHARACTER', '✅'),
('العفو',              'Pardonner',                 'Forgiveness',            'GOOD', 2, 'CHARACTER', '🕊️'),
('طلب العلم',          'Chercher le savoir',        'Seeking Knowledge',      'GOOD', 2, 'KNOWLEDGE', '🎓'),
('حسن الخلق',          'Bon comportement',          'Good Character',         'GOOD', 1, 'CHARACTER', '😊'),
('مساعدة الفقراء',     'Aider les pauvres',         'Help the Poor',          'GOOD', 2, 'CHARITY',   '🤲'),
('التبسم في وجه أخيك', 'Sourire à son frère',       'Smile at Others',        'GOOD', 1, 'CHARACTER', '😄'),
('الشكر',              'Gratitude envers Allah',    'Gratitude',              'GOOD', 1, 'WORSHIP',   '🙏');

-- =====================================================
-- Seed: Bad Actions (سيئات)
-- =====================================================
INSERT INTO actions (name_ar, name_fr, name_en, type, weight, category, icon) VALUES
('ترك الصلاة',         'Manquer la prière',         'Missing Prayer',         'BAD', 3, 'WORSHIP',   '⏰'),
('الكذب',              'Mentir',                    'Lying',                  'BAD', 2, 'CHARACTER', '🤥'),
('الغيبة',             'Médisance',                 'Backbiting',             'BAD', 2, 'CHARACTER', '🗣️'),
('النميمة',            'Calomnie / Colportage',     'Slander',                'BAD', 2, 'CHARACTER', '👂'),
('الكبر',              'Orgueil',                   'Arrogance',              'BAD', 2, 'CHARACTER', '👑'),
('الحسد',              'Envie / Jalousie',          'Envy',                   'BAD', 2, 'CHARACTER', '😒'),
('الغضب',              'Colère excessive',          'Excessive Anger',        'BAD', 1, 'CHARACTER', '😡'),
('الغش',               'Tricher / Frauder',         'Cheating',               'BAD', 2, 'CHARACTER', '🎭'),
('عقوق الوالدين',      'Désobéir aux parents',      'Disobeying Parents',     'BAD', 3, 'FAMILY',    '💔'),
('إيذاء الناس',        'Nuire aux gens',            'Harming Others',         'BAD', 2, 'CHARACTER', '👊'),
('البخل',              'Avarice',                   'Stinginess',             'BAD', 1, 'CHARACTER', '💰'),
('السخرية',            'Moquerie',                  'Mockery',                'BAD', 1, 'CHARACTER', '🤡'),
('قطع الرحم',          'Couper les liens familiaux', 'Cutting Family Ties',    'BAD', 2, 'FAMILY',    '✂️');
