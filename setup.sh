#!/bin/bash

# Create folder structure
mkdir -p app/\(auth\)/login
mkdir -p app/\(dashboard\)/products
mkdir -p app/\(dashboard\)/transactions
mkdir -p app/\(dashboard\)/inventory
mkdir -p app/api/auth
mkdir -p app/api/products
mkdir -p app/api/barcode
mkdir -p app/api/transactions
mkdir -p app/api/payment/cash
mkdir -p app/api/payment/momo

mkdir -p components/ui
mkdir -p components/layout
mkdir -p components/pos
mkdir -p components/products
mkdir -p components/shared

mkdir -p lib/database/models
mkdir -p lib/utils
mkdir -p lib/hooks
mkdir -p lib/store

mkdir -p public/images/products
mkdir -p public/sounds

# Create app files
touch app/\(auth\)/login/page.tsx
touch app/\(auth\)/layout.tsx
touch app/\(dashboard\)/layout.tsx
touch app/\(dashboard\)/page.tsx
touch app/\(dashboard\)/products/page.tsx
touch app/\(dashboard\)/transactions/page.tsx
touch app/\(dashboard\)/inventory/page.tsx
touch app/layout.tsx
touch app/globals.css
touch app/page.tsx

# API routes
touch app/api/auth/route.ts
touch app/api/products/route.ts
touch app/api/products/\[id\]/route.ts
touch app/api/barcode/route.ts
touch app/api/transactions/route.ts
touch app/api/payment/cash/route.ts
touch app/api/payment/momo/route.ts

# Components
touch components/ui/button.tsx
touch components/ui/dialog.tsx
touch components/ui/input.tsx
touch components/ui/card.tsx
touch components/layout/Header.tsx
touch components/layout/Sidebar.tsx
touch components/layout/SearchBar.tsx
touch components/pos/BarcodeScanner.tsx
touch components/pos/CheckoutModal.tsx
touch components/pos/ProductCard.tsx
touch components/pos/ProductGrid.tsx
touch components/pos/PaymentForm.tsx
touch components/pos/MOMOForm.tsx
touch components/products/ProductList.tsx
touch components/products/ProductForm.tsx
touch components/shared/Logo.tsx
touch components/shared/Badge.tsx
touch components/shared/EmptyState.tsx

# Lib files
touch lib/database/connection.ts
touch lib/database/models/index.ts
touch lib/database/models/Product.ts
touch lib/database/models/Transaction.ts
touch lib/database/models/TransactionItem.ts
touch lib/database/models/Category.ts
touch lib/database/models/User.ts
touch lib/utils/barcode.ts
touch lib/utils/payment.ts
touch lib/utils/formatters.ts
touch lib/utils/validators.ts
touch lib/hooks/useBarcodeScanner.ts
touch lib/hooks/useCheckout.ts
touch lib/hooks/useProducts.ts
touch lib/store/cart-store.ts
touch lib/store/modal-store.ts
touch lib/store/ui-store.ts

echo "✅ Next.js folder and file structure created successfully!"