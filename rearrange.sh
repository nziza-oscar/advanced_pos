# Create new route groups
mkdir -p app/\(marketing\)
mkdir -p app/\(auth\)
mkdir -p app/\(dashboard\)/\[tenant\]

# Move files
mv app/page.tsx app/\(marketing\)/page.tsx
mv app/pricing app/\(marketing\)/pricing
mv app/features app/\(marketing\)/features
mv app/about app/\(marketing\)/about

# Move auth pages
mv app/login app/\(auth\)/login
mv app/signup app/\(auth\)/signup
mv app/forgot-password app/\(auth\)/forgot-password

# Move dashboard pages
mv app/dashboard app/\(dashboard\)/\[tenant\]/dashboard
mv app/cashier app/\(dashboard\)/\[tenant\]/cashier
mv app/inventory_manager app/\(dashboard\)/\[tenant\]/inventory

echo "rearranged successfully"