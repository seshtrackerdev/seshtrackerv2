# SeshTracker Project Structure

## Directory Organization

This project follows a strict directory structure to maintain code quality and readability:

```
seshtrackerv2/
├── src/                   # Source code
│   ├── react-app/         # Frontend React application
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── assets/        # Frontend assets
│   └── api/               # Backend API code
├── public/                # Static assets 
│   ├── images/            # Image assets (no duplication)
│   └── legacy/            # Legacy code (old versions)
└── ...                    # Config files (package.json, etc)
```

## Development Workflow

1. Run cleanup script to ensure proper structure:
   ```
   ./cleanup.ps1
   ```

2. Follow these rules when adding new files:
   - Components go in `src/react-app/components/`
   - CSS modules should be named after their component (e.g. `Button.module.css`)
   - All images should be stored in `public/images/`
   - No duplicate files allowed across directories

3. Start the development server:
   ```
   npm run dev
   ```

## Tips for Maintaining Structure

- Use the VSCode file explorer to visually verify the correct directory structure
- Run the cleanup script periodically if you notice file organization issues
- Consult ORGANIZATION-RULES.md for complete guidelines

## Deployment

The deployment script (deploy.ps1) is already configured to work with this structure. 