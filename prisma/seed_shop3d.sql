-- Добавляем тестовые категории
INSERT INTO "Shop3DCategory" (id, name, description, "isActive", "createdAt", "updatedAt")
VALUES
    ('cat1', 'Запчасти', 'Детали и запчасти для различной техники', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat2', 'Корпуса', 'Корпуса для электроники и устройств', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat3', 'Прототипы', 'Прототипы и макеты изделий', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Добавляем теги
INSERT INTO "Shop3DTag" (id, name, description, color, "isActive", "createdAt", "updatedAt")
VALUES
    ('tag1', 'Хит продаж', 'Самые популярные товары', '#FF0000', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('tag2', 'Новинка', 'Новые поступления', '#00FF00', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('tag3', 'Акция', 'Специальные предложения', '#0000FF', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Добавляем пластики
INSERT INTO "Shop3DPlastic" (id, name, material, color, "colorHex", "pricePerGram", "isActive", "createdAt", "updatedAt")
VALUES
    ('pla1', 'PLA Белый', 'PLA', 'Белый', '#FFFFFF', 5.0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('pla2', 'PLA Чёрный', 'PLA', 'Чёрный', '#000000', 5.0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('abs1', 'ABS Красный', 'ABS', 'Красный', '#FF0000', 7.0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('petg1', 'PETG Прозрачный', 'PETG', 'Прозрачный', NULL, 8.0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Добавляем услуги
INSERT INTO "Shop3DService" (id, name, description, "priceFrom", "isActive", "createdAt", "updatedAt")
VALUES
    ('srv1', '3D Моделирование', 'Создание 3D моделей по чертежам и эскизам', 1000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('srv2', '3D Печать', 'Печать изделий на профессиональных 3D принтерах', 500, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('srv3', 'Постобработка', 'Шлифовка, покраска и финишная обработка изделий', 300, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Добавляем контакты
INSERT INTO "Shop3DContact" (id, type, label, value, icon, "isActive", "order", "createdAt", "updatedAt")
VALUES
    ('cnt1', 'phone', 'Телефон для заказов', '+7 (999) 123-45-67', 'FaPhone', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cnt2', 'email', 'Email', 'shop3d@example.com', 'FaEnvelope', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cnt3', 'telegram', 'Telegram', '@shop3d', 'FaTelegram', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Добавляем продукты
INSERT INTO "Shop3DProduct" (id, name, description, price, "productionTime", "isActive", "isFeatured", "categoryId", "createdAt", "updatedAt")
VALUES
    ('prod1', 'Шестерня M2 Z20', 'Прямозубая шестерня модуль 2, 20 зубьев', 150, 1, true, true, 'cat1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('prod2', 'Корпус Raspberry Pi 4', 'Вентилируемый корпус для Raspberry Pi 4', 450, 2, true, false, 'cat2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('prod3', 'Держатель для телефона', 'Универсальный держатель для смартфона', 250, 1, true, true, 'cat3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Связываем продукты с пластиками
INSERT INTO "Shop3DProductPlastic" (id, "productId", "plasticId", "quantity", "createdAt")
VALUES
    ('pp1', 'prod1', 'pla1', 50.0, CURRENT_TIMESTAMP),
    ('pp2', 'prod1', 'abs1', 50.0, CURRENT_TIMESTAMP),
    ('pp3', 'prod2', 'pla2', 100.0, CURRENT_TIMESTAMP),
    ('pp4', 'prod3', 'pla1', 30.0, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Связываем продукты с тегами
INSERT INTO "_Shop3DProductToShop3DTag" ("A", "B")
VALUES
    ('prod1', 'tag1'),
    ('prod2', 'tag2'),
    ('prod3', 'tag1'),
    ('prod3', 'tag3')
ON CONFLICT ("A", "B") DO NOTHING;