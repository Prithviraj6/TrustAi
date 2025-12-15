# Settings Page Redesign

I have redesigned the Settings page to match the premium, polished UI of the Profile page.

## Improvements

### 1. Premium Visuals
- **Hero Banner**: Updated the banner gradient to `from-primary-600 to-purple-600` (and dark mode equivalents) to perfectly match the Profile page's aesthetic.
- **Header Text**: Added "Profile" header text with subtitle to the Profile page banner, matching the style of the Settings page. Aligned spacing by centering the text and setting content margin to `-mt-12` to match Settings exactly.
- **Glassmorphism**: Used subtle transparency and shadows on setting cards.
- **Iconography**: Added colorful icon containers for each section header.

### 2. Enhanced Components
- **Custom Dropdowns**: Replaced the native "Chat Density" and "Default Model" selects with custom Headless UI `Menu` components, featuring smooth transitions, premium styling, and integrated icons.
- **Custom Inputs**: Replaced standard `<select>` and `<input>` elements with custom-styled versions featuring better padding, borders, and focus states.
- **Styled Toggles**: Updated the toggle switches to match the premium aesthetic.
- **Interactive Elements**: Added hover effects and transitions to buttons and interactive cards.
- **Action Icons**: Added descriptive icons (`ChatBubbleLeftRightIcon`, `FolderIcon`, `MagnifyingGlassIcon`, `TrashIcon`) to the "Data & Storage" action buttons for better visual cues.

### 3. Improved Layout
- **Centered Container**: Used a `max-w-5xl` container for optimal readability.
- **Grid Layout**: Organized settings into a responsive grid for better use of space on larger screens.
- **Danger Zone**: Created a distinct, red-themed section for critical actions.

## Verification
- **Build**: `npm run build` passed successfully.
- **Visuals**: Verified the layout consistency with the Profile page and responsive behavior.
