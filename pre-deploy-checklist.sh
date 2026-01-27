#!/bin/bash
# Pre-deployment validation checklist

echo "📋 Pre-Deployment Checklist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"

PASSED=0
FAILED=0

checks=(
    "Onchainweb/.env:Environment variables configured"
    "firebase.json:Firebase config exists"
    ".firebaserc:Firebase project configured"
    "firestore.rules:Security rules exist"
    "firestore.indexes.json:Database indexes configured"
)

for check in "${checks[@]}"; do
    file=$(echo $check | cut -d: -f1)
    desc=$(echo $check | cut -d: -f2)
    
    if [ -f "$file" ] || [ -d "$file" ]; then
        echo "✅ $desc"
        ((PASSED++))
    else
        echo "❌ $desc"
        ((FAILED++))
    fi
done

# Check if build succeeds
echo -n "Building application... "
cd Onchainweb
if npm run build > /tmp/build.log 2>&1; then
    echo "✅ Build successful"
    ((PASSED++))
else
    echo "❌ Build failed"
    ((FAILED++))
    echo "Check /tmp/build.log for details"
fi
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Results: $PASSED passed, $FAILED failed"

if [ $FAILED -gt 0 ]; then
    echo "❌ Fix issues before deploying"
    exit 1
fi

echo "✅ Ready to deploy!"
