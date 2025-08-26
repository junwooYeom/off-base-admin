#!/bin/bash

# Script to switch between Supabase branches

echo "Supabase Branch Switcher"
echo "========================"
echo ""
echo "Select branch to switch to:"
echo "1) Main (Production)"
echo "2) Master (Development)"
echo ""
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        echo "Switching to Main branch..."
        cp .env.main .env.local
        echo "✅ Switched to Main branch (Production)"
        echo "URL: https://dijtowiohxvwdnvgprud.supabase.co"
        ;;
    2)
        echo "Switching to Master branch..."
        cp .env.master .env.local
        echo "✅ Switched to Master branch (Development)"
        echo "URL: https://bjwhxrapqobyjccnviud.supabase.co"
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "Please restart your development server for changes to take effect:"
echo "  npm run dev"