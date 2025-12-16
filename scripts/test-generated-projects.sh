
#!/bin/bash

echo "## Testing generated projects..."

test_project() {
  local project_dir=$1
  echo ""
  echo "Testing $project_dir..."
  
  cd "$project_dir" || exit 1
  
  # Install dependencies
  echo "  # Installing dependencies..."
  npm install --silent
  
  # Generate Prisma client
  echo "  # Generating Prisma client..."
  npx prisma generate --silent
  
  # Build project
  echo "  #  Building project..."
  npm run build --silent
  
  echo "  ✓ $project_dir tested successfully!"
  
  cd - > /dev/null || exit 1
}

# Test all generated projects
for dir in generated/*/; do
  if [ -d "$dir" ]; then
    test_project "$dir"
  fi
done

echo ""
echo "✓ All projects tested successfully!"