# CHISS SHOP

- Ajouter une boutique de office

## Depot

- Add depot on the inventaire

## Gestion de commande à l'étranger

## Order structure

- Polo adulte, Shuttle, Jaune, 30, (6S, 4M, 10L, 5XL, 5XXL)

## Product type

- Add brand: No brand

- T-shirt (Round neck)
  - Adulte
  - Junior
- Polo
  - Adulte
  - Junior
- Longsleeve T-shirt
  - Adulte
  - Junior
- Longsleeve Polo

  - Adulte
  - Junior

## Calculation

- Product(Type, Brand, Couleur, Size)

## Add client management (phone number, name)

-

## Dashboard

- Daily sales
- Sales based on type and Brand
- Sales summary at the boutique
- Stock d'alerte

## Transfer

- Shops should be able to transfer good from one shop to another.

- In product we hold all the possible combination of (type|brand|color|size|collar color for polo)
  - When adding products, we should allow multiselect for color, collar color and size and then we create multiple products depending on how many colors, collar colors and sizes were selected
- In inventory, we have location, product, quantity and price (we should set different prices per location)
- Adding inventory, will be selecting the product and the location, set the quantity and the price
- Selecting the product will be filtering through all the product properties until we stay with one:
  This will be applied when:

  - adding inventories
  - creating orders

- We should limit one inventory of a product to one location (in location bukavu, we should have one inventory of the product x): before inserting, we should find the inventory based on the location and the productId, then, we update the price and the quantity by adding if it exist and create a new one if it doesn't exist

# TOOLS

- https://v0.dev/chat
- https://ui.shadcn.com/docs/components/accordion
- NextJS
- T3
- DB: Turso
- Tailwind

## Technologies Used

- Node.js
- Nest js
- Docker
- TypeScript
- Prisma
- PostgreSQL

## Database ERD

<image src="./prisma-erd.svg">

### Scripts

| Script | Description | Params |
| ------ | ----------- | ------ |

## Bugs

No known bugs. If you find any, please reach out.
