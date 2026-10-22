# VARBAN MARKETS — WEB APP TRANSLATION SKILL

## OBJECTIVE
Implement complete, production-quality internationalization (i18n)
across the existing web application. Support exactly these five language
options, matching the language selector already shown in the app:
  Language             Locale    Native label
  English (default)    en      English
  French               fr      Français
  Spanish              es      Español
  Portuguese           pt      Português
  Simplified Chinese   zh-CN   简体中文

Do not substitute Swahili or another language for Chinese. Use
Simplified Chinese (zh-CN) unless the project already has a deliberate
locale convention that must be preserved.

## CORE RULES
1. **Inspect before changing.** Identify the framework, router, current
   language selector, existing translation libraries, route structure,
   UI components, authentication flow, and build/test commands. Reuse
   the project's existing i18n setup if it is sound. Do not introduce a
   competing translation system.
2. **Translate the whole app.** Do not stop at the landing page or
   navigation. Cover every route, shared component, modal, dialog,
   dropdown, form, tooltip, table, chart control, empty state, loading
   state, error, toast, email template, and mobile view.
3. **Preserve behavior and design.** Do not redesign pages, change
   branding, remove features, alter business logic, or change route
   behavior just to accommodate translations. Keep existing styling and
   responsive behavior. Allow text to wrap naturally; prevent clipping,
   overlap, and horizontal overflow.
4. **Use native-quality language.** Translate meaning, not individual
   words mechanically. Use clear, professional terminology suitable for
   a financial/trading product. Keep tone, capitalization, punctuation,
   and terminology consistent within each locale.
5. **No mixed-language UI.** A selected locale must not leave ordinary
   interface text in English, except for proper nouns, official product
   names, symbols, ticker symbols, technical identifiers, and content
   that intentionally remains user-authored.
6. **No fake completion.** Do not add a language option that does not
   work. Do not claim full translation until the route audit and
   verification checklist pass.
7. **Avoid destructive changes.** Do not remove existing data, replace
   unrelated components, or overwrite user changes. Make focused
   changes and explain any necessary dependency or configuration
   changes.

## IMPLEMENTATION WORKFLOW
1. **Audit the application**
- Inspect the repository structure, package manifest, routing setup,
  layout files, design system, and current locale selector.
- Search all source files for user-facing strings, including
  hard-coded labels and dynamically generated messages.
- Inspect authentication, account settings, dashboards, trading
  screens, deposits/withdrawals, market lists, order tickets,
  notifications, support/help, legal pages, and admin screens where
  present.
- Identify server-rendered content, client-rendered content, API error
  messages, validation schemas, emails, and metadata.
- Record the existing locale and route conventions before
  implementation.
- Do not translate database keys, API fields, enum values, URLs, CSS
  class names, event names, or internal identifiers.
2. **Use the right translation architecture**
- Follow the existing framework and router conventions. For Next.js,
  distinguish App Router from Pages Router and support server and
  client components appropriately.
- Prefer a maintained i18n library already installed in the project.
  If none exists, choose a suitable library compatible with the actual
  framework and explain the choice before adding dependencies.
- Store user-facing strings in locale resource files, organized by
  feature or namespace. Keep keys stable and descriptive, for example
  common.save, auth.signIn, trading.buy, and
  orders.emptyState.
- Use translation functions/components rather than inline conditional
  expressions scattered throughout the code.
- Keep English as the fallback locale. A missing translation should
  fall back predictably without crashing the page; log or flag missing
  keys during development.
- Persist the user's choice using the app's established approach
  (prefer locale-based routes or the project's existing preference
  mechanism; otherwise use a suitable cookie or local storage). Avoid
  hydration mismatches.
- Make locale selection work across navigation and refreshes. Preserve
  the selected language after sign-in and route changes.
- If locale-prefixed URLs are used, ensure links, redirects, canonical
  URLs, and middleware handle each supported locale correctly.
- Set the document's lang attribute to the active locale. Set
  appropriate text direction and layout behavior for supported
  scripts. These five languages are left-to-right, so do not add RTL
  behavior unless the app supports other RTL locales for a separate
  reason.
3. **Build complete locale resources**
Every user-facing key used by the application must exist in all five locales. Adapt to the project's structure. Page titles, descriptions, metadata, labels, placeholders, errors, etc., must be covered.
4. **Translate trading and financial terminology carefully**
Translate Buy, Sell, Long, Short, Market Order, Limit Order, Spread, Equity, Balance, P&L, etc. Keep ticker symbols and currency codes unchanged. Use locale-aware APIs for formatting.
5. **Localize dates, numbers, and dynamic content**
Use Intl.NumberFormat and Intl.DateTimeFormat. Avoid hard-coded separators.
6. **Make the language selector reliable**
Native labels: English, Français, Español, Português, 简体中文. Indicators and keyboard accessibility required.
7. **Accessibility and layout quality**
Check long strings (French/Portuguese) for clipping. Use proper lang attributes.

*Status: Implementation Phase - Maintenance Node.*