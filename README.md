# Sanika Mhatre | Portfolio

A responsive, static portfolio based on `Sanika_Resume_Nov_26.pdf`. No framework, package installation, or build step is required.

## Preview

Open `index.html` in a browser. Fonts are loaded from Google Fonts and icons from the pinned Lucide CDN; an internet connection is needed for those enhancements. Content, project diagrams, and navigation are local.

## Publish on GitHub Pages

1. Add these files to the root of your GitHub repository, keeping the `assets` folder and resume PDF.
2. In the repository's **Settings > Pages**, choose **Deploy from a branch**.
3. Select your publishing branch and **/ (root)**, then save.

For a user site, the repository must match the GitHub account: `SanikaMhatre.github.io` for the resume's `SanikaMhatre` account. Other repository names publish under a project path. All local links are relative to support either option.

## Edit

- `index.html`: biography, experience, projects, contact links, and resume link.
- `styles.css`: colors, typography, spacing, and responsive layouts.
- `script.js`: navigation section highlighting, current year, and icons.
- `assets/`: original explanatory architecture diagrams, not clinical results or actual model predictions.

Experience dates, metrics, and education come from the supplied resume. The P&ID Digitizer and VoiceStack project summaries also draw from their public repository READMEs. P&ID evaluation uses generated sheets; VoiceStack uses rule-based parsing without an LLM and has not been validated on an Alexa+ device. The introductory biography is an initial editorial draft for review. No unpublished implementation details or seniority claims have been added.

The site has no tracking, contact-form backend, or deployment automation. Email links open the visitor's email application.