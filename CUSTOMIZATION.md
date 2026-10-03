# Customize GovSync

## Colors

Edit app/theme.css. One palette controls login, dashboards and application screens:

```css
--brand-primary: #102B3A;       /* navy headings and text */
--brand-accent: #B94220;        /* primary buttons */
--brand-accent-hover: #993318;  /* button hover */
--brand-secondary: #B94220;
--brand-secondary-strong: #A53819; /* links */
--page-background: #FBF5E9;     /* dashboard background */
--login-background: #FBF0DA;    /* warm login/hero background */
--surface: #FFFDFA;             /* forms and panels */
--surface-muted: #F5EBDC;
--text: #172F3C;
--text-muted: #5C6465;
--border: #DED5C5;
--heading-font: Georgia, "Times New Roman", serif;
```

Keep status colors separate: green means success, amber means review, red means failure. Test button text and form labels after changing colors. Normal-size text should have at least 4.5:1 contrast (https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Login and dashboard illustration

Put a new image in public/images/, then change:

```css
--illustration: url('/images/your-illustration.png');
```

The leading / points to the public directory. Do not write /public/images or a Windows file path. Current asset: public/images/citizen-login-illustration.png.

The same asset appears in both layouts. Its fit is controlled by .login-illustration and .dashboard-art in app/auth-theme.css. Adjust background-size/background-position there. Keep important subjects away from the edges because narrow layouts crop the asset. Mobile layouts hide decorative imagery to prioritize the form.

Update the illustration description in app/login.tsx and its Hindi/Marathi translations if the subject changes. The dashboard illustration is decorative and hidden from screen readers.

Your original Bhartiya-naari files are retained. They contain embedded English lettering; using them as a full banner would leave that text untranslated. The new illustration has no embedded text.

## Logo and branding

Edit app/site-config.ts: name and logo. Current logo path is /images/govsync-logo.png, copied from your supplied logo. Replace it with your image and update the path. It is used on both the login and authenticated header. Brand headings remain selectable HTML text.

The legacy hero configuration is retained for reference, but the current dashboard illustration uses --illustration as described above.

## Layout and typography

- app/auth-theme.css is loaded after globals.css and controls the new login, dashboard and shared overrides.
- app/globals.css controls existing application forms, tables, permissions and certificates.
- app/login.tsx controls login/registration/recovery content.
- app/portal.tsx controls dashboard tiles, search, navigation and help.
- app/views.tsx controls administration and application history.
- Keep a visible keyboard focus outline, explicit form labels and meaningful errors.
- Check narrow screens and 200% text after layout edits.

## Translations

Add every new English interface key with Hindi and Marathi values in app/auth-translations.ts (new login/dashboard) or app/i18n.tsx (existing application flow). Run node scripts/test-i18n.mjs. User-entered names, notes, phone identifiers, tracking references and raw API field names keep their original form.

## Illustration provenance

The built-in image-generation tool was used to adapt your supplied illustration into a text-free asset, saved at public/images/citizen-login-illustration.png. The supplied original was preserved.

Prompt: Edit the supplied GovSync citizen illustration banner. Keep the Indian woman with dark hair, rust kurta, cream dupatta and silver laptop, a peach desk, pale civic building and plants. Remove all lettering, slogans, labels, department badges and connectors. Compose a wide 3:2 illustration with the woman on the left, laptop near the center, pale government building on the right, and cream #FBF0DA background. Use restrained flat shapes and minimal shading, no frame, text or logos; keep all headings in HTML.
