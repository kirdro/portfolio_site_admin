# 3D Shop Structure

## Database Models Created
- Shop3DService - Услуги
- Shop3DCategory - Категории
- Shop3DTag - Теги 
- Shop3DPlastic - Пластики/материалы
- Shop3DProduct - Продукты/детали
- Shop3DProductPlastic - Many-to-many связь продуктов и пластиков
- Shop3DContact - Контакты магазина

## Routes Structure
```
/shop3d                     → Redirect to /shop3d/products
/shop3d/products           → Управление продуктами
/shop3d/services           → Управление услугами
/shop3d/categories         → Категории товаров
/shop3d/tags               → Теги (хит, премиум)
/shop3d/plastics           → Пластики и материалы
/shop3d/contacts           → Контакты магазина
```

## API Routes (tRPC)
```
api.shop3d.products.*
api.shop3d.services.*
api.shop3d.categories.*
api.shop3d.tags.*
api.shop3d.plastics.*
api.shop3d.contacts.*
```

## Components
- SimpleList - универсальный список
- SimpleFormModal - универсальная форма
- Product3DCard, Product3DGrid - для продуктов

## Next Steps
1. Create page files for each subsection
2. Implement forms and CRUD operations
3. Add file upload for images
4. Test all functionality
