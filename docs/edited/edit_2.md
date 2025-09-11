Нам надо проанализировать весь проект. Я вижу что моковых данных вроде нет, но создание данных не работает
1. Раздел проекты
   1. Есть модалка где я вношу данные проекта но он не создается такое впечатление что кнопка ни к чему не привязана.
   2. У модалки надо сделать бекгроунд черный а то сейчас она прозрачная
   3. В список технлогий мало технологий к примеру нет призмы добавь туда все технлогии которые ты знаешь
   4. Сделай что бы в этой модалке когда нажать создать то реально создавался проект
2. Раздел Навыки
   1. У нас так же модалка прозрачная а надо темную
   2. Вроде кнопка создать куда то ведет вот ручка которая дергается curl 'https://admin.kirdro.ru/api/trpc/admin.skills.getAll?batch=1&input=%7B%7D' \
      -H 'accept: */*' \
      -H 'accept-language: ru,en;q=0.9' \
      -H 'cache-control: no-cache' \
      -b '__Host-next-auth.csrf-token=a312d215028aadf48c882cd1b8551662ec76d5e2d456a7687a1eeb08774fcd12%7C20b865629982d554cfbb14ae38e92f75dacf33237f46a1b3ec0476d0776afed9; __Secure-next-auth.callback-url=https%3A%2F%2Fadmin.kirdro.ru%2F; next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..shYVxp5aYqVGCkg8.jqU6liOYjUzmityqYndlxPPsClMkMivL_tvZHHUyZeInD9a97sXLYq2_KnIPzLu2PmXhD8tFzCDoox_sXXOTnfSpqLxcAhE6TPlVUHMKIO40kv4L1raMkhHvM2H0KMq1MLU-GYq5sqhDQGtbihmXHW_E00_p91_0CadhcpO60oUBB-IEbndqf2A8-GlJGU_fShOZlMeiXb8UzOdBZTiETg-AXqXhbnmsTO6ef9K_a1BPmSODbE4Wjoa6oEBut0i47aYEjYGB1TgXaJDdo7XVKVjmcuwp27LKeYk7dc0Ci0XPOlwaEy94akgwmHlwx6DtGyLjKyrn3A.7-YAmVYYfCO_LIliQz9WvA; next-auth.csrf-token=d998b672aaa0ef8f606cc0034432257461c950115155e78368d89c3303461fec%7C81e8a3c329a82f3edab114c4ec0a25adf2f74d88c9e70f7a06e5bfcad242aef0; next-auth.callback-url=https%3A%2F%2Fadmin.kirdro.ru%2F; next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..m1n6YvnXB446wf5d.sZ3O2_xpL-GSgDgL_LIozGvfCyKAOiGC1bLYJst91bfpkq8rSKIPlIFkFruY-vvhjnBVfVBKomkaxmxbcQLoWXG-lMSsODhIThnjVUxe8JNMDwJtwDuJACh7hQydbo_NTrP4hHPVnOzUEuUF-2T7PDFF8YpN_lA3lKU5CtfwJRbptb-xyHKUgt1s71AfsLzhre_bMV_CkJNZQp0S5UbPJVyLI3qANQrmgN8JKQkgODou7OUP37sir6g9Dgp9n49ZGGMLPbWVGCO1zQuU6f93gcBvxFVndzVLFN19BPTRvWbumiylX3emuMbukJwB0n6TK0QGSKVgsg.T8WGRmEAKcr4YQj5lBQ0wQ' \
      -H 'pragma: no-cache' \
      -H 'priority: u=1, i' \
      -H 'referer: https://admin.kirdro.ru/skills' \
      -H 'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138", "YaBrowser";v="25.8", "Yowser";v="2.5"' \
      -H 'sec-ch-ua-mobile: ?0' \
      -H 'sec-ch-ua-platform: "Linux"' \
      -H 'sec-fetch-dest: empty' \
      -H 'sec-fetch-mode: cors' \
      -H 'sec-fetch-site: same-origin' \
      -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 YaBrowser/25.8.0.0 Safari/537.36'
   3. Но эта ручка не доабвлет новые данные в список и вообще не понятно работает
   4. Надо разобраться с этим или если надо сделать с нуля запросу для этого раздела что бы сохранялись и показывались Навыки
3. Раздел чат
   1. Надо проверить все ли запросы работают нормально или надо что то еще подключить. Я вижу что есть сообщения но почему то неизвестный пользователь но мы вроде храним почту того кто написал
4. Раздел ИИ чат
   1. Так же все проверь пожалуйста
5. Раздел Настройки
   1. Проверь все ли работает как задумывалось.
6. Так всегда держи в контексте @docs/PROJECT_DOCUMENTATION_INDEX.md обязательно что бы быть в понимании проекта и не выходить за рамки
7. Надо создать раздел блог
   1. Тут я буду вести свой блог и писать статьи, надо что бы он был в стиле нашего сайта
   2.  Давай попробуем подключить либу для текста https://www.blocknotejs.org
   3. Прочти всю документацию https://www.blocknotejs.org/docs
   4. Так же прочти как подключить https://www.blocknotejs.org/docs/features/ai/getting-started ai у нас есть ключ для groq (хранится в переменных окружения)
   5. Сделай все правильно как надо и что бы все работало а текст должен сохраняться в базу данных
   6. у нас сейчас в схеме и в базе нет таблиц для этого по этому их надо создать но надо все проанализировать что бы все нужные поля были которые требует это библиотека для текст
   7. Стиль должен быть как основной стиль у нас на сайте

Создай чек лист подробный и понятный мне и ии с выполнением этих задач и сохраним его в @docs/edited И после ничего не делай мне надо его посмотреть